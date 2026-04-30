package ch.samira.tesan.kitcord.chat;

import java.util.List;

public class CreateChatRequest {

    private String name;
    private ChatType chatType;
    private List<Long> userIds;

    public CreateChatRequest() {
    }

    public String getName() {
        return name;
    }

    public ChatType getChatType() {
        return chatType;
    }

    public List<Long> getUserIds() {
        return userIds;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setChatType(ChatType chatType) {
        this.chatType = chatType;
    }

    public void setUserIds(List<Long> userIds) {
        this.userIds = userIds;
    }
}