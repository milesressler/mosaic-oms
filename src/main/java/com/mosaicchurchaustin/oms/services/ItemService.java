package com.mosaicchurchaustin.oms.services;

import com.mosaicchurchaustin.oms.data.entity.ItemCategory;
import com.mosaicchurchaustin.oms.data.entity.ItemEntity;
import com.mosaicchurchaustin.oms.data.request.CreateItemRequest;
import com.mosaicchurchaustin.oms.data.request.UpdateItemRequest;
import com.mosaicchurchaustin.oms.exception.EntityNotFoundException;
import com.mosaicchurchaustin.oms.exception.InvalidRequestException;
import com.mosaicchurchaustin.oms.repositories.ItemRepository;
import jakarta.transaction.Transactional;
import org.apache.commons.lang3.StringUtils;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ItemService {

    @Autowired
    ItemRepository itemRepository;

    public List<ItemEntity> getSuggestedItems() {
        return itemRepository.findAllByIsSuggestedItem(true);
    }

    @Transactional
    public Page<ItemEntity> getPagedItems(final Pageable pageable) {
        return itemRepository.findAllByRemovedIsFalse(pageable).map(itemEntity -> {
            Hibernate.initialize(itemEntity.getOrderItems());
            return itemEntity;
        });
    }

    @Transactional
    public void removeItem(final Long id) {
        final ItemEntity itemEntity = itemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Item", id.toString()));

        itemEntity.setRemoved(true);
        itemRepository.save(itemEntity);

    }

    @Transactional
    public ItemEntity updateItem(final Long id, final UpdateItemRequest request) {
        final ItemEntity itemEntity = itemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Item", id.toString()));

        if (request.suggestedItem() != null) {
            itemEntity.setIsSuggestedItem(request.suggestedItem());
        }

        if (request.category() != null) {
            itemEntity.setCategory(ItemCategory.from(request.category()));
        }

        if (request.placeholder() != null) {
            // If blank string, we map to null - this allows nullification as well as partial updates
            itemEntity.setPlaceholder(StringUtils.defaultIfBlank(request.placeholder(), null));
        }

        return itemRepository.save(itemEntity);
    }

    @Transactional
    public ItemEntity createItem(final CreateItemRequest request) {
        if (itemRepository.findByDescription(request.description().trim()).isPresent()) {
            throw new InvalidRequestException(String.format("Item description %s already exists", request.description().trim()));
        }

        final ItemEntity itemEntity = ItemEntity.builder()
                .description(request.description().trim())
                .placeholder(StringUtils.defaultIfBlank(request.placeholder(), null))
                .category(StringUtils.isNotBlank(request.category()) ? ItemCategory.from(request.category()) : null)
                .build();

        return itemRepository.save(itemEntity);
    }
}
