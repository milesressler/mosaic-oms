package com.mosaicchurchaustin.oms.services;

import com.mosaicchurchaustin.oms.data.entity.customer.CustomerEntity;
import com.mosaicchurchaustin.oms.data.entity.item.ItemCategory;
import com.mosaicchurchaustin.oms.data.entity.item.ItemEntity;
import com.mosaicchurchaustin.oms.data.entity.item.ItemLimitEntryEntity;
import com.mosaicchurchaustin.oms.data.entity.item.ItemLimitRule;
import com.mosaicchurchaustin.oms.data.entity.item.LimitPeriodUnit;
import com.mosaicchurchaustin.oms.data.entity.item.LimitWindow;
import com.mosaicchurchaustin.oms.data.entity.order.OrderEventType;
import com.mosaicchurchaustin.oms.data.entity.order.OrderStatus;
import com.mosaicchurchaustin.oms.data.response.CustomerItemHistoryResponse;
import com.mosaicchurchaustin.oms.data.response.CustomerItemHistoryResponse.Source;
import com.mosaicchurchaustin.oms.repositories.CustomerRepository;
import com.mosaicchurchaustin.oms.repositories.ItemLimitEntryRepository;
import com.mosaicchurchaustin.oms.repositories.ItemRepository;
import com.mosaicchurchaustin.oms.repositories.OrderItemRepository;
import com.mosaicchurchaustin.oms.services.limits.ItemLimitCalculator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class CustomerItemHistoryServiceTest {

    @Mock CustomerRepository customerRepository;
    @Mock OrderItemRepository orderItemRepository;
    @Mock ItemLimitEntryRepository itemLimitEntryRepository;
    @Mock ItemRepository itemRepository;

    @InjectMocks CustomerItemHistoryService service;

    private final CustomerEntity customer = CustomerEntity.builder().firstName("Sam").build();
    private final ItemEntity coat = item(1L, "Coat", ItemCategory.CLOTHING, true);
    private final ItemEntity socks = item(2L, "Socks", ItemCategory.CLOTHING, false);

    private static final CustomerItemHistoryService.Filters NO_FILTERS =
            new CustomerItemHistoryService.Filters(false, CustomerItemHistoryService.FillFilter.ALL, null, null, null, null);

    private static Instant local(final String isoLocalDateTime) {
        return LocalDateTime.parse(isoLocalDateTime).atZone(ItemLimitCalculator.ZONE).toInstant();
    }

    private static ItemEntity item(final long id, final String description, final ItemCategory category, final boolean limited) {
        final ItemEntity item = ItemEntity.builder()
                .description(description)
                .category(category)
                .limitRule(limited ? ItemLimitRule.builder().quantity(1).periodValue(1)
                        .periodUnit(LimitPeriodUnit.YEAR).window(LimitWindow.ROLLING).build() : null)
                .build();
        ReflectionTestUtils.setField(item, "id", id);
        return item;
    }

    private static OrderItemRepository.CustomerItemHistoryLine line(final long orderId, final ItemEntity item,
                                                                    final int requested, final int fulfilled,
                                                                    final Instant completedAt) {
        final OrderItemRepository.CustomerItemHistoryLine line = mock(OrderItemRepository.CustomerItemHistoryLine.class);
        when(line.getOrderId()).thenReturn(orderId);
        when(line.getItemId()).thenReturn(item.getId());
        when(line.getQuantity()).thenReturn(requested);
        when(line.getQuantityFulfilled()).thenReturn(fulfilled);
        when(line.getCompletedAt()).thenReturn(completedAt);
        return line;
    }

    private ItemLimitEntryEntity entry(final ItemEntity item, final LocalDate receivedOn) {
        final ItemLimitEntryEntity entry = ItemLimitEntryEntity.builder()
                .customer(customer)
                .itemEntity(item)
                .receivedOn(receivedOn)
                .quantity(1)
                .notes("intake sheet")
                .build();
        ReflectionTestUtils.setField(entry, "id", 99L);
        return entry;
    }

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(customer, "id", 7L);
        when(customerRepository.findByUuid("customer-uuid")).thenReturn(Optional.of(customer));
        when(itemRepository.findAllById(any())).thenReturn(List.of(coat, socks));
        // Built before stubbing the repositories; Mockito can't stub inside another stubbing call
        final List<OrderItemRepository.CustomerItemHistoryLine> lines = List.of(
                line(10L, coat, 1, 1, local("2026-03-25T11:00:00")),
                line(11L, socks, 2, 0, local("2026-10-01T11:00:00")));
        final List<ItemLimitEntryEntity> entries = List.of(entry(coat, LocalDate.of(2026, 6, 1)));
        when(orderItemRepository.findCompletedHistory(7L, OrderStatus.COMPLETED, OrderEventType.STATUS_CHANGE))
                .thenReturn(lines);
        when(itemLimitEntryRepository.findAllByCustomerIdOrderByReceivedOnDescIdDesc(7L)).thenReturn(entries);
    }

    @Test
    void mergesOrdersAndRecordedPickups_newestFirst() {
        final Page<CustomerItemHistoryResponse> page = service.getHistory("customer-uuid", NO_FILTERS, PageRequest.of(0, 25));

        assertThat(page.getTotalElements()).isEqualTo(3);
        assertThat(page.getContent()).extracting(CustomerItemHistoryResponse::source)
                .containsExactly(Source.ORDER, Source.RECORDED, Source.ORDER);
        assertThat(page.getContent().get(0).orderId()).isEqualTo(11L);
        assertThat(page.getContent().get(1).entry().notes()).isEqualTo("intake sheet");
        assertThat(page.getContent().get(1).receivedAt()).isEqualTo(local("2026-06-01T00:00:00"));
    }

    @Test
    void unfilled_excludesFilledLinesAndRecordedPickups() {
        final Page<CustomerItemHistoryResponse> page = service.getHistory("customer-uuid",
                new CustomerItemHistoryService.Filters(false, CustomerItemHistoryService.FillFilter.UNFILLED, null, null, null, null),
                PageRequest.of(0, 25));

        assertThat(page.getContent()).hasSize(1);
        assertThat(page.getContent().get(0).item().getDescription()).isEqualTo("Socks");
    }

    @Test
    void received_includesFilledLinesAndRecordedPickups() {
        final Page<CustomerItemHistoryResponse> page = service.getHistory("customer-uuid",
                new CustomerItemHistoryService.Filters(false, CustomerItemHistoryService.FillFilter.RECEIVED, null, null, null, null),
                PageRequest.of(0, 25));

        assertThat(page.getContent()).extracting(CustomerItemHistoryResponse::source)
                .containsExactly(Source.RECORDED, Source.ORDER);
        assertThat(page.getContent()).extracting(row -> row.item().getDescription()).containsOnly("Coat");
    }

    @Test
    void limitedOnly_keepsOnlyLimitedItems() {
        final Page<CustomerItemHistoryResponse> page = service.getHistory("customer-uuid",
                new CustomerItemHistoryService.Filters(true, CustomerItemHistoryService.FillFilter.ALL, null, null, null, null), PageRequest.of(0, 25));

        assertThat(page.getContent()).extracting(row -> row.item().getDescription()).containsOnly("Coat");
        assertThat(page.getTotalElements()).isEqualTo(2);
    }

    @Test
    void searchAndDateRange_filterInLocalTime() {
        final Page<CustomerItemHistoryResponse> page = service.getHistory("customer-uuid",
                new CustomerItemHistoryService.Filters(false, CustomerItemHistoryService.FillFilter.ALL, null, "coa",
                        LocalDate.of(2026, 6, 1), LocalDate.of(2026, 12, 31)), PageRequest.of(0, 25));

        assertThat(page.getContent()).hasSize(1);
        assertThat(page.getContent().get(0).source()).isEqualTo(Source.RECORDED);
    }

    @Test
    void pagesInMemory() {
        final Page<CustomerItemHistoryResponse> second = service.getHistory("customer-uuid", NO_FILTERS, PageRequest.of(1, 2));

        assertThat(second.getTotalElements()).isEqualTo(3);
        assertThat(second.getTotalPages()).isEqualTo(2);
        assertThat(second.getContent()).hasSize(1);
        assertThat(second.getContent().get(0).orderId()).isEqualTo(10L);
    }
}
