package com.mosaicchurchaustin.oms.services;

import com.mosaicchurchaustin.oms.data.entity.customer.CustomerEntity;
import com.mosaicchurchaustin.oms.data.request.MergeCustomerRequest;
import com.mosaicchurchaustin.oms.data.response.MergeCustomerResponse;
import com.mosaicchurchaustin.oms.exception.InvalidRequestException;
import com.mosaicchurchaustin.oms.repositories.CustomerRepository;
import com.mosaicchurchaustin.oms.repositories.OrderRepository;
import com.mosaicchurchaustin.oms.repositories.ShowerReservationRepository;
import com.mosaicchurchaustin.oms.services.audit.AuditService;
import com.mosaicchurchaustin.oms.services.common.CustomerResolver;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock CustomerRepository customerRepository;
    @Mock CustomerResolver customerResolver;
    @Mock OrderRepository orderRepository;
    @Mock ShowerReservationRepository showerReservationRepository;
    @Mock AuditService auditService;

    @InjectMocks CustomerService customerService;

    private CustomerEntity buildCustomer(final String uuid, final long id, final String firstName, final String lastName) {
        final CustomerEntity customer = CustomerEntity.builder()
                .firstName(firstName)
                .lastName(lastName)
                .build();
        ReflectionTestUtils.setField(customer, "uuid", uuid);
        ReflectionTestUtils.setField(customer, "id", id);
        return customer;
    }

    private void stubMerge(final CustomerEntity from, final CustomerEntity to, final int orders, final int reservations) {
        when(customerRepository.findByUuid(from.getUuid())).thenReturn(Optional.of(from));
        when(customerRepository.findByUuid(to.getUuid())).thenReturn(Optional.of(to));
        when(orderRepository.updateCustomerForAllOrders(from.getId(), to.getId())).thenReturn(orders);
        when(showerReservationRepository.updateCustomerForAllReservations(from.getId(), to.getId())).thenReturn(reservations);
    }

    @Test
    void mergeCustomers_selfMerge_throwsInvalidRequestException() {
        final MergeCustomerRequest request = new MergeCustomerRequest(
                "same-uuid", "same-uuid", null, null, null, null, null, null);

        assertThatThrownBy(() -> customerService.mergeCustomers(request))
                .isInstanceOf(InvalidRequestException.class);
    }

    @Test
    void mergeCustomers_transfersOrdersAndReservations() {
        final CustomerEntity from = buildCustomer("from-uuid", 1L, "Jon", "Smith");
        final CustomerEntity to = buildCustomer("to-uuid", 2L, "John", "Smith");
        stubMerge(from, to, 3, 1);

        final MergeCustomerRequest request = new MergeCustomerRequest(
                "from-uuid", "to-uuid", null, null, null, null, null, null);

        final MergeCustomerResponse response = customerService.mergeCustomers(request);

        assertThat(response.ordersTransferred()).isEqualTo(3L);
        assertThat(response.showerReservationsTransferred()).isEqualTo(1L);
        assertThat(response.success()).isTrue();
        assertThat(response.mergedToCustomerUuid()).isEqualTo("to-uuid");
    }

    @Test
    void mergeCustomers_deletesSourceAndLogsAudit() {
        final CustomerEntity from = buildCustomer("from-uuid", 1L, "Jon", "Smith");
        final CustomerEntity to = buildCustomer("to-uuid", 2L, "John", "Smith");
        stubMerge(from, to, 0, 0);

        customerService.mergeCustomers(new MergeCustomerRequest(
                "from-uuid", "to-uuid", null, null, null, null, null, null));

        verify(customerRepository).delete(from);
        verify(auditService).logCustomerMerge(from, to);
    }

    @Test
    void mergeCustomers_appliesPropertyOverridesToKeptCustomer() {
        final CustomerEntity from = buildCustomer("from-uuid", 1L, "Jon", "Smyth");
        final CustomerEntity to = buildCustomer("to-uuid", 2L, "John", "Smith");
        stubMerge(from, to, 0, 0);

        // Use source's first name, flag the merged record; last name left null (keep existing)
        final MergeCustomerRequest request = new MergeCustomerRequest(
                "from-uuid", "to-uuid", true, null, null, null, "Jon", null);

        customerService.mergeCustomers(request);

        assertThat(to.getFirstName()).isEqualTo("Jon");
        assertThat(to.getLastName()).isEqualTo("Smith");
        assertThat(to.isFlagged()).isTrue();
        verify(customerRepository).save(to);
    }

    @Test
    void mergeCustomers_nullProperties_doNotOverwriteExistingValues() {
        final CustomerEntity from = buildCustomer("from-uuid", 1L, "Jon", "Smyth");
        final CustomerEntity to = buildCustomer("to-uuid", 2L, "John", "Smith");
        to.setFlagged(true);
        stubMerge(from, to, 0, 0);

        customerService.mergeCustomers(new MergeCustomerRequest(
                "from-uuid", "to-uuid", null, null, null, null, null, null));

        assertThat(to.getFirstName()).isEqualTo("John");
        assertThat(to.getLastName()).isEqualTo("Smith");
        assertThat(to.isFlagged()).isTrue();
    }

    @Test
    void mergeCustomers_waiverCarriedOverFromSource() {
        final CustomerEntity from = buildCustomer("from-uuid", 1L, "Jon", "Smith");
        final Instant sourceWaiver = Instant.now().minusSeconds(60);
        from.setShowerWaiverCompleted(sourceWaiver);

        final CustomerEntity to = buildCustomer("to-uuid", 2L, "John", "Smith");
        stubMerge(from, to, 0, 0);

        final MergeCustomerRequest request = new MergeCustomerRequest(
                "from-uuid", "to-uuid", null, null, null,
                sourceWaiver.atOffset(ZoneOffset.UTC), null, null);

        customerService.mergeCustomers(request);

        assertThat(to.getShowerWaiverCompleted()).isEqualTo(sourceWaiver);
    }

    @Test
    void mergeCustomers_noWaiverInRequest_doesNotOverwriteExistingWaiver() {
        final CustomerEntity from = buildCustomer("from-uuid", 1L, "Jon", "Smith");
        final CustomerEntity to = buildCustomer("to-uuid", 2L, "John", "Smith");
        final Instant existingWaiver = Instant.now().minusSeconds(3600);
        to.setShowerWaiverCompleted(existingWaiver);
        stubMerge(from, to, 0, 0);

        customerService.mergeCustomers(new MergeCustomerRequest(
                "from-uuid", "to-uuid", null, null, null, null, null, null));

        assertThat(to.getShowerWaiverCompleted()).isEqualTo(existingWaiver);
    }
}
