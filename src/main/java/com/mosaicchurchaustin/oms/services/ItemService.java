package com.mosaicchurchaustin.oms.services;

import com.google.common.collect.Maps;
import com.mosaicchurchaustin.oms.data.entity.item.ItemAttribute;
import com.mosaicchurchaustin.oms.data.entity.item.ItemAttributeOption;
import com.mosaicchurchaustin.oms.data.entity.item.ItemAttributeType;
import com.mosaicchurchaustin.oms.data.entity.item.ItemAvailability;
import com.mosaicchurchaustin.oms.data.entity.item.ItemCategory;
import com.mosaicchurchaustin.oms.data.entity.item.ItemEntity;
import com.mosaicchurchaustin.oms.data.request.CreateItemRequest;
import com.mosaicchurchaustin.oms.data.request.ItemAttributeRequest;
import com.mosaicchurchaustin.oms.data.request.UpdateItemRequest;
import com.mosaicchurchaustin.oms.data.response.SuggestedItemResponse;
import com.mosaicchurchaustin.oms.exception.EntityNotFoundException;
import com.mosaicchurchaustin.oms.exception.InvalidRequestException;
import com.mosaicchurchaustin.oms.repositories.ItemAttributeOptionRepository;
import com.mosaicchurchaustin.oms.repositories.ItemAttributeRepository;
import com.mosaicchurchaustin.oms.repositories.ItemRepository;
import com.mosaicchurchaustin.oms.util.strings.SlugUtils;
import jakarta.transaction.Transactional;
import org.apache.commons.lang3.StringUtils;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ItemService {
    public static final String ITEMS_KEY = "itemsKey";

    @Autowired
    ItemRepository itemRepository;

    @Autowired
    ItemAttributeRepository itemAttributeRepository;

    @Autowired
    ItemAttributeOptionRepository itemAttributeOptionRepository;

    @Transactional
    @Cacheable(value = "items", key = "#root.target.ITEMS_KEY")
    public Map<ItemCategory, List<SuggestedItemResponse>> getSuggestedItems() {
        return itemRepository.findAllManagedItems()
                .map(SuggestedItemResponse::from)
                .collect(
                Collectors.groupingBy(
                        (item) -> item.getCategory() == null ? ItemCategory.OTHER : item.getCategory(),
                        Collectors.toList())
        );
    }

    @Transactional
    public Page<ItemEntity> getPagedItems(final Pageable pageable, final Boolean managedItemsOnly, final List<ItemCategory> categories) {
        Specification<ItemEntity> spec = Specification.where(null);

        if (Boolean.TRUE.equals(managedItemsOnly)) {
            spec = spec.and((root, query, cb) ->
                    cb.isTrue(root.get("managed")));
        }

        if (categories != null && !categories.isEmpty()) {
            spec = spec.and((root, query, cb) ->
                    root.get("category").in(categories));
        }

        final Page<ItemEntity> result = itemRepository.findAll(spec, pageable);
        result.map(ItemEntity::getAttributes)
                .forEach(Hibernate::initialize);
        return result;
    }

    @Transactional
    @CacheEvict(value = "items", key = "#root.target.ITEMS_KEY")
    public void removeItem(final Long id) {
        final ItemEntity itemEntity = itemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(ItemEntity.ENTITY_TYPE, id.toString()));

        itemEntity.setManaged(false);
        itemRepository.save(itemEntity);

    }

    @Transactional
    @CacheEvict(value = "items", key = "#root.target.ITEMS_KEY")
    public ItemEntity updateItem(final Long id, final UpdateItemRequest request) {
        final ItemEntity itemEntity = itemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(ItemEntity.ENTITY_TYPE, id.toString()));

        if (request.managed() != null) {
            itemEntity.setManaged(request.managed());
        }


        if (StringUtils.isNotBlank(request.description())) {
            itemEntity.setDescription(request.description());
        }

        if (request.availability() != null) {
            itemEntity.setAvailability(ItemAvailability.from(request.availability()));
        }

        if (request.category() != null) {
            itemEntity.setCategory(ItemCategory.from(request.category()));
        }

        if (request.placeholder() != null) {
            // If blank string, we map to null - this allows nullification as well as partial updates
            itemEntity.setPlaceholder(StringUtils.defaultIfBlank(request.placeholder(), null));
        }

        if (request.attributes() != null) {
            syncItemAttributes(itemEntity, request.attributes());
        }

        return itemRepository.save(itemEntity);
    }

    @Transactional
    @CacheEvict(value = "items", key = "#root.target.ITEMS_KEY")
    public ItemEntity createItem(final CreateItemRequest request) {
        if (itemRepository.findByDescription(request.description().trim()).isPresent()) {
            throw new InvalidRequestException(String.format("Item description %s already exists", request.description().trim()));
        }

        final ItemEntity itemEntity = ItemEntity.builder()
                .description(request.description().trim())
                .placeholder(StringUtils.defaultIfBlank(request.placeholder(), null))
                .managed(request.managed() ==  Boolean.TRUE ? Boolean.TRUE : Boolean.FALSE)
                .availability(StringUtils.isNotBlank(request.availability()) ? ItemAvailability.from(request.availability()) : ItemAvailability.AVAILABLE)
                .category(StringUtils.isNotBlank(request.category()) ? ItemCategory.from(request.category()) : null)
                .build();

        return itemRepository.save(itemEntity);
    }

    public void syncItemAttributes(final ItemEntity itemEntity, final List<ItemAttributeRequest> request) {
        if (CollectionUtils.isEmpty(request)) {
            itemAttributeRepository.deleteAllInBatch(itemEntity.getAttributes());
            itemEntity.getAttributes().clear();
            return;
        }
        
        // Validate that non-TEXT attributes have options
        for (ItemAttributeRequest attr : request) {
            if (attr.attributeType() != ItemAttributeType.TEXT && (attr.options() == null || attr.options().isEmpty())) {
                throw new InvalidRequestException(String.format("Attribute '%s' of type %s must have options", attr.label(), attr.attributeType()));
            }
            if (attr.attributeType() == ItemAttributeType.TEXT && attr.options() != null && !attr.options().isEmpty()) {
                throw new InvalidRequestException(String.format("Attribute '%s' of type TEXT cannot have options", attr.label()));
            }
        }
        final Map<String, ItemAttribute> existingAttributes = itemEntity.getAttributes().stream().collect(Collectors.toMap(
                ItemAttribute::getValue,
                attribute -> attribute
        ));

        final Map<String, ItemAttributeRequest> requestedAttributes = request.stream().collect(Collectors.toMap(
           requested -> SlugUtils.generateSlug(requested.label()),
            requested -> requested
        ));

        final var comparison = Maps.difference(existingAttributes, requestedAttributes);

        comparison.entriesOnlyOnLeft().forEach((slug, val) -> {
            itemAttributeRepository.delete((ItemAttribute) val);
            itemEntity.getAttributes().remove(val);
        });

        comparison.entriesOnlyOnRight().forEach((slug, val) -> {
            final ItemAttributeRequest itemAttributeRequest = (ItemAttributeRequest) val;
            final ItemAttribute newAttribute = itemAttributeRepository.save(
                    ItemAttribute.builder()
                            .label(itemAttributeRequest.label())
                            .value(slug)
                            .required(itemAttributeRequest.required())
                            .attributeType(itemAttributeRequest.attributeType())
                            .itemEntity(itemEntity)
                            .groupName(itemAttributeRequest.groupName())
                            .groupOrder(itemAttributeRequest.groupOrder())
                            .build()
            );

            // Only create options for non-TEXT types
            if (itemAttributeRequest.attributeType() != ItemAttributeType.TEXT && itemAttributeRequest.options() != null) {
                itemAttributeRequest.options().stream().map(option -> ItemAttributeOption.builder()
                                .label(option)
                                .value(SlugUtils.generateSlug(option))
                                .availability(ItemAvailability.AVAILABLE)
                                .itemAttribute(newAttribute)
                                .build())
                        .map(itemAttributeOptionRepository::save)
                        .forEach(saved -> newAttribute.getAttributeOptions().add(saved));
            }
        });

        // handle entries in both (but different types)
        // Update "required" for item attributes
        // Compare iotinos with Maps.difference, then get the options entities in sycn with the requested options
        // Attributes that exist in both: update mutable fields and sync options.
        comparison.entriesDiffering().forEach((slug, commonPair) -> {
            final ItemAttribute existingAttr = (ItemAttribute) commonPair.leftValue() ;
            final ItemAttributeRequest requestedAttr = (ItemAttributeRequest) commonPair.rightValue();

            // Validate that attributeType is immutable
            if (existingAttr.getAttributeType() != requestedAttr.attributeType()) {
                throw new InvalidRequestException(String.format("Cannot change attribute type for '%s' from %s to %s. Attribute type is immutable.", 
                    existingAttr.getLabel(), existingAttr.getAttributeType(), requestedAttr.attributeType()));
            }

            // Update mutable fields: required flag, groupName, groupOrder
            if (existingAttr.getRequired() != requestedAttr.required()) {
                existingAttr.setRequired(requestedAttr.required());
            }
            
            existingAttr.setGroupName(requestedAttr.groupName());
            existingAttr.setGroupOrder(requestedAttr.groupOrder());

            // Only process options for non-TEXT types
            if (requestedAttr.attributeType() != ItemAttributeType.TEXT) {
                // Process options for this attribute:
                // Build map of existing options by slug (using attributeOptions())
                final Map<String, ItemAttributeOption> existingOptions = existingAttr.getAttributeOptions().stream()
                        .collect(Collectors.toMap(
                                opt -> opt.getValue().toLowerCase(),
                                opt -> opt,
                                (a, b) -> a
                        ));

                // Build map of requested options from the request (keyed by generated slug)
                final Map<String, String> requestedOptions = requestedAttr.options().stream()
                        .collect(Collectors.toMap(
                                option -> SlugUtils.generateSlug(option).toLowerCase(),
                                option -> option,
                                (a, b) -> a
                        ));

                // Compare options using Maps.difference
                final var optionsComparison = Maps.difference(existingOptions, requestedOptions);

                // Remove options that are in existing but not requested
                optionsComparison.entriesOnlyOnLeft().forEach((optSlug, optEntity) -> {
                    existingAttr.getAttributeOptions().remove(optEntity);
                    itemAttributeOptionRepository.delete((ItemAttributeOption) optEntity);
                });

                // Add new options that are in the request but not existing
                optionsComparison.entriesOnlyOnRight().forEach((optSlug, optionStr) -> {
                    final ItemAttributeOption newOption = ItemAttributeOption.builder()
                            .label((String) optionStr)
                            .value(optSlug)
                            .availability(ItemAvailability.AVAILABLE)
                            .itemAttribute(existingAttr)
                            .build();
                    final ItemAttributeOption persistedOption = itemAttributeOptionRepository.save(newOption);
                    existingAttr.getAttributeOptions().add(persistedOption);
                });
            } else {
                // For TEXT types, remove any existing options since TEXT shouldn't have any
                if (!existingAttr.getAttributeOptions().isEmpty()) {
                    itemAttributeOptionRepository.deleteAllInBatch(existingAttr.getAttributeOptions());
                    existingAttr.getAttributeOptions().clear();
                }
            }

            // For common options, labels are immutable so no update is required.
            itemAttributeRepository.save(existingAttr);
        });

    }

}
