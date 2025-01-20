package com.mosaicchurchaustin.oms.client;

import lombok.extern.slf4j.Slf4j;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class GroupMeBotClient {

    private static final String GROUPME_BOT_POST_URL = "https://api.groupme.com/v3/bots/post";

    @Value("${groupme.botId}")
    private String botId;

    private final OkHttpClient client = new OkHttpClient();


    public void postMessage(final String message) throws Exception {

        final String escapedMessage = message.replace("\n", "\\n");
        final String jsonInputString = String.format("{\"bot_id\": \"%s\", \"text\": \"%s\"}", botId, escapedMessage);

        final RequestBody body = RequestBody.create(jsonInputString, MediaType.get("application/json; charset=utf-8"));
        Request request = new Request.Builder()
                .url(GROUPME_BOT_POST_URL)
                .post(body)
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (response.isSuccessful()) {
                log.debug("Message posted successfully.");
            } else {
                log.error("Failed to post message. Response code: " + response.code());
            }
        }
    }
}
