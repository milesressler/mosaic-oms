package com.mosaicchurchaustin.oms.controllers.admin;

import com.mosaicchurchaustin.oms.data.request.ActiveSpecialEventRequest;
import com.mosaicchurchaustin.oms.data.request.SpecialEventRequest;
import com.mosaicchurchaustin.oms.data.response.SpecialEventResponse;
import com.mosaicchurchaustin.oms.services.events.SpecialEventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/special-event")
@RequiredArgsConstructor
public class AdminSpecialEventController {

    final SpecialEventService specialEventService;

    @ResponseBody
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public List<SpecialEventResponse> getEvents() {
        return specialEventService.getAllEvents();
    }

    @ResponseBody
    @GetMapping(path = "/{uuid}", produces = MediaType.APPLICATION_JSON_VALUE)
    public SpecialEventResponse getEvent(@PathVariable("uuid") final String uuid) {
        return specialEventService.getEvent(uuid);
    }

    @ResponseBody
    @PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public SpecialEventResponse createEvent(@Valid @RequestBody final SpecialEventRequest request) {
        return specialEventService.createEvent(request);
    }

    @ResponseBody
    @PutMapping(path = "/{uuid}", produces = MediaType.APPLICATION_JSON_VALUE)
    public SpecialEventResponse updateEvent(@PathVariable("uuid") final String uuid,
                                            @Valid @RequestBody final SpecialEventRequest request) {
        return specialEventService.updateEvent(uuid, request);
    }

    @DeleteMapping(path = "/{uuid}")
    public void deleteEvent(@PathVariable("uuid") final String uuid) {
        specialEventService.deleteEvent(uuid);
    }

    /**
     * Archives (archived=true) or restores (archived=false) an event
     */
    @ResponseBody
    @PutMapping(path = "/{uuid}/archived", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<SpecialEventResponse> setArchived(@PathVariable("uuid") final String uuid,
                                                  @RequestParam("archived") final boolean archived) {
        specialEventService.setArchived(uuid, archived);
        return specialEventService.getAllEvents();
    }

    /**
     * Starts the given event for order takers (stopping any other), or stops the running event when uuid is null
     */
    @ResponseBody
    @PutMapping(path = "/active", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<SpecialEventResponse> setActiveEvent(@RequestBody final ActiveSpecialEventRequest request) {
        specialEventService.setActiveEvent(request.uuid());
        return specialEventService.getAllEvents();
    }
}
