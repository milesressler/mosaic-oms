package com.mosaicchurchaustin.oms.services.events;

import com.mosaicchurchaustin.oms.data.entity.customer.CustomerEntity;
import com.mosaicchurchaustin.oms.data.entity.event.SpecialEventEntity;
import com.mosaicchurchaustin.oms.data.entity.event.SpecialEventItemEntity;
import com.mosaicchurchaustin.oms.data.entity.feature.FeatureConfigEntity;
import com.mosaicchurchaustin.oms.data.entity.item.ItemAvailability;
import com.mosaicchurchaustin.oms.data.entity.item.ItemEntity;
import com.mosaicchurchaustin.oms.data.entity.order.OrderEntity;
import com.mosaicchurchaustin.oms.data.request.CreateSpecialEventOrderRequest;
import com.mosaicchurchaustin.oms.data.request.SpecialEventItemRequest;
import com.mosaicchurchaustin.oms.data.request.SpecialEventRequest;
import com.mosaicchurchaustin.oms.data.response.SpecialEventItemResponse;
import com.mosaicchurchaustin.oms.data.response.SpecialEventResponse;
import com.mosaicchurchaustin.oms.exception.InvalidRequestException;
import com.mosaicchurchaustin.oms.repositories.CustomerRepository;
import com.mosaicchurchaustin.oms.repositories.FeatureConfigRepository;
import com.mosaicchurchaustin.oms.repositories.ItemRepository;
import com.mosaicchurchaustin.oms.repositories.OrderItemRepository;
import com.mosaicchurchaustin.oms.repositories.OrderRepository;
import com.mosaicchurchaustin.oms.repositories.SpecialEventItemRepository;
import com.mosaicchurchaustin.oms.repositories.SpecialEventRepository;
import com.mosaicchurchaustin.oms.services.FeaturesService;
import com.mosaicchurchaustin.oms.services.OrderService;
import com.mosaicchurchaustin.oms.services.common.CustomerResolver;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SpecialEventServiceTest {

    @Mock SpecialEventRepository specialEventRepository;
    @Mock SpecialEventItemRepository specialEventItemRepository;
    @Mock ItemRepository itemRepository;
    @Mock OrderRepository orderRepository;
    @Mock OrderItemRepository orderItemRepository;
    @Mock CustomerRepository customerRepository;
    @Mock FeatureConfigRepository featureConfigRepository;
    @Mock CustomerResolver customerResolver;
    @Mock FeaturesService featuresService;
    @Mock OrderService orderService;

    @InjectMocks SpecialEventService specialEventService;

    private static final UUID CUSTOMER_UUID = UUID.fromString("00000000-0000-0000-0000-000000000001");

    private SpecialEventEntity event;
    private ItemEntity radio;
    private ItemEntity blanket;
    private CustomerEntity customer;

    @BeforeEach
    void setUp() {
        radio = item(10L, "radio");
        blanket = item(11L, "blanket");
        event = SpecialEventEntity.builder().name("Christmas Giveaway").itemsPerGuest(1).build();
        ReflectionTestUtils.setField(event, "id", 1L);
        ReflectionTestUtils.setField(event, "uuid", "event-uuid");
        event.getItems().add(line(event, radio, 60, 0));
        event.getItems().add(line(event, blanket, 20, 1));

        customer = CustomerEntity.builder().firstName("John").lastName("Jimm").build();
        ReflectionTestUtils.setField(customer, "id", 5L);
    }

    private static ItemEntity item(final long id, final String description) {
        final ItemEntity item = ItemEntity.builder().description(description).availability(ItemAvailability.AVAILABLE).build();
        ReflectionTestUtils.setField(item, "id", id);
        return item;
    }

    private static SpecialEventItemEntity line(final SpecialEventEntity event, final ItemEntity item,
                                               final Integer quantity, final int sortOrder) {
        final SpecialEventItemEntity line = SpecialEventItemEntity.builder()
                .specialEvent(event).itemEntity(item).quantityAvailable(quantity).sortOrder(sortOrder).build();
        ReflectionTestUtils.setField(line, "id", 100L + sortOrder);
        return line;
    }

    private static OrderItemRepository.ItemClaimCount claim(final long itemId, final long claimed) {
        return new OrderItemRepository.ItemClaimCount() {
            @Override public Long getItemId() { return itemId; }
            @Override public Long getClaimed() { return claimed; }
        };
    }

    private void eventIsActive(final boolean active) {
        when(featureConfigRepository.findFirstByOrderByIdDesc())
                .thenReturn(FeatureConfigEntity.builder().activeSpecialEvent(active ? event : null).build());
    }

    private void readyToOrder(final List<OrderItemRepository.ItemClaimCount> claimed) {
        when(specialEventRepository.findByUuid("event-uuid")).thenReturn(Optional.of(event));
        eventIsActive(true);
        when(customerResolver.resolveOrCreate(eq(CUSTOMER_UUID), any(), any())).thenReturn(customer);
        when(specialEventItemRepository.findForUpdate(eq(1L), anyCollection())).thenReturn(event.getItems());
        when(orderItemRepository.countClaimedForSpecialEventLocking(eq(1L), anyCollection())).thenReturn(claimed);
    }

    private static CreateSpecialEventOrderRequest order(final boolean allowAdditional, final Long... itemIds) {
        return new CreateSpecialEventOrderRequest(CUSTOMER_UUID, null, null, null, List.of(itemIds), allowAdditional);
    }

    @Test
    void createOrder_whenEventNotRunning_isRejected() {
        when(specialEventRepository.findByUuid("event-uuid")).thenReturn(Optional.of(event));
        eventIsActive(false);

        assertThatThrownBy(() -> specialEventService.createOrder("event-uuid", order(false, 10L)))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("not running");
        verify(orderService, never()).createSpecialEventOrder(any(), any(), any());
    }

    @Test
    void createOrder_withMoreItemsThanAllowed_isRejected() {
        when(specialEventRepository.findByUuid("event-uuid")).thenReturn(Optional.of(event));
        eventIsActive(true);

        assertThatThrownBy(() -> specialEventService.createOrder("event-uuid", order(false, 10L, 11L)))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("Only one item");
    }

    @Test
    void createOrder_whenLastUnitIsGone_isRejected() {
        readyToOrder(List.of(claim(11L, 20)));
        when(orderRepository.findAllByCustomerIdAndSpecialEventIdAndOrderStatusNotIn(anyLong(), anyLong(), anyCollection()))
                .thenReturn(List.of());

        assertThatThrownBy(() -> specialEventService.createOrder("event-uuid", order(false, 11L)))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("Blanket just ran out");
        verify(orderService, never()).createSpecialEventOrder(any(), any(), any());
    }

    @Test
    void createOrder_takesTheLastUnit() {
        readyToOrder(List.of(claim(11L, 19)));
        when(orderRepository.findAllByCustomerIdAndSpecialEventIdAndOrderStatusNotIn(anyLong(), anyLong(), anyCollection()))
                .thenReturn(List.of());
        final OrderEntity created = OrderEntity.builder().build();
        when(orderService.createSpecialEventOrder(event, customer, List.of(blanket))).thenReturn(created);

        assertThat(specialEventService.createOrder("event-uuid", order(false, 11L))).isSameAs(created);
    }

    @Test
    void createOrder_forUnavailableItem_isRejected() {
        radio.setAvailability(ItemAvailability.UNAVAILABLE);
        readyToOrder(List.of());
        when(orderRepository.findAllByCustomerIdAndSpecialEventIdAndOrderStatusNotIn(anyLong(), anyLong(), anyCollection()))
                .thenReturn(List.of());

        assertThatThrownBy(() -> specialEventService.createOrder("event-uuid", order(false, 10L)))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("Radio is unavailable");
    }

    @Test
    void createOrder_forGuestWithAnOrder_needsConfirmation() {
        when(specialEventRepository.findByUuid("event-uuid")).thenReturn(Optional.of(event));
        eventIsActive(true);
        when(customerResolver.resolveOrCreate(eq(CUSTOMER_UUID), any(), any())).thenReturn(customer);
        when(orderRepository.findAllByCustomerIdAndSpecialEventIdAndOrderStatusNotIn(eq(5L), eq(1L), anyCollection()))
                .thenReturn(List.of(OrderEntity.builder().build()));

        assertThatThrownBy(() -> specialEventService.createOrder("event-uuid", order(false, 10L)))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("John already has an order");
        verify(orderService, never()).createSpecialEventOrder(any(), any(), any());
    }

    @Test
    void createOrder_forGuestWithAnOrder_goesThroughWhenConfirmed() {
        readyToOrder(List.of(claim(10L, 3)));
        final OrderEntity created = OrderEntity.builder().build();
        when(orderService.createSpecialEventOrder(event, customer, List.of(radio))).thenReturn(created);

        assertThat(specialEventService.createOrder("event-uuid", order(true, 10L))).isSameAs(created);
        verify(orderRepository, never()).findAllByCustomerIdAndSpecialEventIdAndOrderStatusNotIn(anyLong(), anyLong(), anyCollection());
    }

    @Test
    void getActiveEvent_showsStockLeft() {
        eventIsActive(true);
        when(specialEventRepository.findById(1L)).thenReturn(Optional.of(event));
        when(orderItemRepository.countClaimedForSpecialEvent(eq(1L), anyCollection()))
                .thenReturn(List.of(claim(10L, 59), claim(11L, 25)));

        final SpecialEventResponse response = specialEventService.getActiveEvent().orElseThrow();

        assertThat(response.isActive()).isTrue();
        final Map<Long, SpecialEventItemResponse> byItem = Map.of(
                response.getItems().get(0).getItem().getId(), response.getItems().get(0),
                response.getItems().get(1).getItem().getId(), response.getItems().get(1));
        assertThat(byItem.get(10L).getRemaining()).isEqualTo(1);
        // More given out than stock (e.g. stock lowered after the fact) shows as none left, not negative
        assertThat(byItem.get(11L).getRemaining()).isZero();
    }

    @Test
    void getActiveEvent_whenNoneRunning_isEmpty() {
        eventIsActive(false);

        assertThat(specialEventService.getActiveEvent()).isEmpty();
    }

    @Test
    void updateEvent_keepsExistingLinesAndDropsRemovedOnes() {
        final SpecialEventItemEntity radioLine = event.getItems().get(0);
        when(specialEventRepository.findByUuid("event-uuid")).thenReturn(Optional.of(event));
        when(specialEventRepository.save(event)).thenReturn(event);
        eventIsActive(false);
        final ItemEntity backpack = item(12L, "backpack");
        when(itemRepository.findById(12L)).thenReturn(Optional.of(backpack));

        specialEventService.updateEvent("event-uuid", new SpecialEventRequest("Christmas Giveaway 2026", null, 1, List.of(
                new SpecialEventItemRequest(12L, 60),
                new SpecialEventItemRequest(10L, 50))));

        assertThat(event.getName()).isEqualTo("Christmas Giveaway 2026");
        assertThat(event.getItems()).extracting(l -> l.getItemEntity().getDescription()).containsExactly("backpack", "radio");
        assertThat(event.getItems().get(1)).isSameAs(radioLine);
        assertThat(radioLine.getQuantityAvailable()).isEqualTo(50);
        verify(featuresService, never()).setActiveSpecialEvent(any());
    }

    @Test
    void updateEvent_whenRunning_refreshesTheCachedName() {
        when(specialEventRepository.findByUuid("event-uuid")).thenReturn(Optional.of(event));
        when(specialEventRepository.save(event)).thenReturn(event);
        eventIsActive(true);

        specialEventService.updateEvent("event-uuid", new SpecialEventRequest("Renamed", null, 1, List.of(
                new SpecialEventItemRequest(10L, 60))));

        verify(featuresService).setActiveSpecialEvent(event);
    }

    @Test
    void deleteEvent_withOrders_isRejected() {
        when(specialEventRepository.findByUuid("event-uuid")).thenReturn(Optional.of(event));
        eventIsActive(false);
        when(orderRepository.existsBySpecialEventId(1L)).thenReturn(true);

        assertThatThrownBy(() -> specialEventService.deleteEvent("event-uuid"))
                .isInstanceOf(InvalidRequestException.class);
        verify(specialEventRepository, never()).delete(any());
    }
}
