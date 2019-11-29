package model;

public enum  MessageCommand {
    CREATE_MSG("CREATE_MSG"),
    LAST_50_MSG("LAST_50_MSG"),
    INTERNAL_ERROR_MSG("INTERNAL_ERROR_MSG");

    private String value;

    MessageCommand(String value) {
        this.value = value;
    }

    @Override
    public String toString() {
        return value;
    }
}
