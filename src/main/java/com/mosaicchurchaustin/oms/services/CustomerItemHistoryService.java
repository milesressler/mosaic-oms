package com.mosaicchurchaustin.oms.services;

import com.mosaicchurchaustin.oms.data.entity.customer.CustomerEntity;
import com.mosaicchurchaustin.oms.data.entity.item.ItemCategory;
import com.mosaicchurchaustin.oms.data.entity.item.ItemEntity;
import com.mosaicchurchaustin.oms.data.entity.order.OrderEventType;
import com.mosaicchurchaustin.oms.data.entity.order.OrderStatus;
import com.mosaicchurchaustin.oms.data.response.CustomerItemHistoryResponse;
import com.mosaicchurchaustin.oms.data.response.CustomerItemHistoryResponse.Source;
import com.mosaicchurchaustin.oms.data.response.ItemLimitEntryResponse;
import com.mosaicchurchaustin.oms.data.response.OrderItemResponse;
import com.mosaicchurchaustin.oms.data.response.SuggestedItemResponse;
import com.mosaicchurchaustin.oms.exception.EntityNotFoundException;
import com.mosaicchurchaustin.oms.repositories.CustomerRepository;
import com.mosaicchurchaustin.oms.repositories.ItemLimitEntryRepository;
import com.mosaicchurchaustin.oms.repositories.ItemRepository;
import com.mosaicchurchaustin.oms.repositories.OrderItemRepository;
import com.mosaicchurchaustin.oms.services.limits.ItemLimitCalculator;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * What a customer has received or asked for: items on their completed orders (filled or not) plus pickups
 * recorded by hand. Built when read from where each fact lives, so there is nothing to keep in sync.
 * Filtering and paging happen in memory since one customer's history is small.
 */
@Service
@RequiredArgsConstructor
public class CustomerItemHistoryService {

    final CustomerRepository customerRepository;
    final OrderItemRepository orderItemRepository;
    final ItemLimitEntryRepository itemLimitEntryRepository;
    final ItemRepository itemRepository;

    public enum FillFilter {
        ALL,
        /** Got at least one, including recorded pickups */
        RECEIVED,
        /** Got fewer than asked for, including partial fills */
        UNFILLED
    }

    public record Filters(
            boolean limitedOnly,
            FillFilter fill,
            ItemCategory category,
            String query,
            LocalDate from,
            LocalDate to
    ) {
    }

    @Transactional
    public Page<CustomerItemHistoryResponse> getHistory(final String customerUuid, final Filters filters, final Pageable pageable) {
        final CustomerEntity customer = customerRepository.findByUuid(customerUuid)
                .orElseThrow(() -> new EntityNotFoundException(CustomerEntity.ENTITY_TYPE, customerUuid));

        final List<OrderItemRepository.CustomerItemHistoryLine> orderLines = orderItemRepository.findCompletedHistory(
                customer.getId(), OrderStatus.COMPLETED, OrderEventType.STATUS_CHANGE);
        // Recorded pickups are always fully received, so they never match "unfilled"
        final List<ItemLimitEntryResponse> entries = filters.fill() == FillFilter.UNFILLED ? List.of()
                : itemLimitEntryRepository.findAllByCustomerIdOrderByReceivedOnDescIdDesc(customer.getId()).stream()
                    .map(ItemLimitEntryResponse::from)
                    .toList();

        final Map<Long, ItemEntity> items = itemRepository.findAllById(Stream.concat(
                        orderLines.stream().map(OrderItemRepository.CustomerItemHistoryLine::getItemId),
                        entries.stream().map(ItemLimitEntryResponse::itemId))
                        .distinct()
                        .toList())
                .stream()
                .collect(Collectors.toMap(ItemEntity::getId, Function.identity()));
        final Map<Long, SuggestedItemResponse> itemResponses = items.values().stream()
                .collect(Collectors.toMap(ItemEntity::getId, SuggestedItemResponse::from));

        final Stream<CustomerItemHistoryResponse> fromOrders = orderLines.stream()
                .filter(line -> matchesFill(filters.fill(),
                        Objects.requireNonNullElse(line.getQuantityFulfilled(), 0), line.getQuantity()))
                .map(line -> new CustomerItemHistoryResponse(
                        Source.ORDER,
                        line.getCompletedAt() != null ? line.getCompletedAt() : line.getOrderUpdated(),
                        itemResponses.get(line.getItemId()),
                        line.getQuantity(),
                        line.getQuantityFulfilled(),
                        line.getAttributes() == null ? Map.of() : OrderItemResponse.attributeDisplays(line.getAttributes()),
                        line.getNotes(),
                        line.getOrderId(),
                        line.getOrderUuid(),
                        null));

        final Stream<CustomerItemHistoryResponse> fromEntries = entries.stream()
                .map(entry -> new CustomerItemHistoryResponse(
                        Source.RECORDED,
                        entry.receivedOn().atStartOfDay(ItemLimitCalculator.ZONE).toInstant(),
                        itemResponses.get(entry.itemId()),
                        entry.quantity(),
                        entry.quantity(),
                        Map.of(),
                        entry.notes(),
                        null,
                        null,
                        entry));

        final List<CustomerItemHistoryResponse> rows = Stream.concat(fromOrders, fromEntries)
                .filter(row -> matches(row, items.get(row.item().getId()), filters))
                .sorted(Comparator.comparing(CustomerItemHistoryResponse::receivedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();

        final int start = (int) Math.min(pageable.getOffset(), rows.size());
        final int end = Math.min(start + pageable.getPageSize(), rows.size());
        return new PageImpl<>(rows.subList(start, end), pageable, rows.size());
    }

    private static boolean matchesFill(final FillFilter fill, final int fulfilled, final int requested) {
        return switch (fill == null ? FillFilter.ALL : fill) {
            case ALL -> true;
            case RECEIVED -> fulfilled > 0;
            case UNFILLED -> fulfilled < requested;
        };
    }

    private static boolean matches(final CustomerItemHistoryResponse row, final ItemEntity item, final Filters filters) {
        if (filters.limitedOnly() && !item.isLimited()) {
            return false;
        }
        if (filters.category() != null && filters.category() != item.getCategory()) {
            return false;
        }
        if (StringUtils.isNotBlank(filters.query())
                && !StringUtils.containsIgnoreCase(item.getDescription(), filters.query().trim())) {
            return false;
        }
        if (filters.from() != null || filters.to() != null) {
            if (row.receivedAt() == null) {
                return false;
            }
            final LocalDate receivedOn = row.receivedAt().atZone(ItemLimitCalculator.ZONE).toLocalDate();
            if (filters.from() != null && receivedOn.isBefore(filters.from())) {
                return false;
            }
            if (filters.to() != null && receivedOn.isAfter(filters.to())) {
                return false;
            }
        }
        return true;
    }
}
