package com.mosaicchurchaustin.oms.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

@Component
public class GroupMeClient {

    private static final String GROUPME_BOT_POST_URL = "https://api.groupme.com/v3/bots/post";

    @Value("${groupme.botId}")
    private String botId;

    public void postMessage(String message) throws Exception {
        URL url = new URL(GROUPME_BOT_POST_URL);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod("POST");
        connection.setRequestProperty("Content-Type", "application/json; utf-8");
        connection.setDoOutput(true);

        String escapedMessage = message.replace("\n", "\\n");
        String jsonInputString = String.format("{\"bot_id\": \"%s\", \"text\": \"%s\"}", botId, escapedMessage);

        try (OutputStream os = connection.getOutputStream()) {
            byte[] input = jsonInputString.getBytes(StandardCharsets.UTF_8);
            os.write(input, 0, input.length);
            os.flush();
        }

        int responseCode = connection.getResponseCode();
        if (responseCode == HttpURLConnection.HTTP_OK) {
            System.out.println("Message posted successfully.");
        } else {
            System.out.println("Failed to post message. Response code: " + responseCode);
        }
    }
}