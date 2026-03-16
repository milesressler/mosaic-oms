package com.mosaicchurchaustin.oms.controllers.admin;

import com.mosaicchurchaustin.oms.data.entity.user.UserEntity;
import com.mosaicchurchaustin.oms.data.request.AiQueryRequest;
import com.mosaicchurchaustin.oms.data.response.AiQueryResponse;
import com.mosaicchurchaustin.oms.services.AiQueryService;
import com.mosaicchurchaustin.oms.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/ai-query")
@RequiredArgsConstructor
public class AdminAiQueryController {

    private final AiQueryService aiQueryService;
    private final UserService userService;

    @PostMapping
    public AiQueryResponse query(@Valid @RequestBody final AiQueryRequest request) {
        final UserEntity currentUser = userService.currentUser();
        return aiQueryService.processQuery(request.getQuestion(), request.getHistory(), currentUser);
    }
}
