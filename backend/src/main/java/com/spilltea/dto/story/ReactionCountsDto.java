package com.spilltea.dto.story;

public class ReactionCountsDto {
    private long hearYou = 0;
    private long feltThisToo = 0;
    private long thankYou = 0;
    private long sendingSupport = 0;

    public ReactionCountsDto() {}

    public ReactionCountsDto(long hearYou, long feltThisToo, long thankYou, long sendingSupport) {
        this.hearYou = hearYou;
        this.feltThisToo = feltThisToo;
        this.thankYou = thankYou;
        this.sendingSupport = sendingSupport;
    }

    public long getHearYou() { return hearYou; }
    public void setHearYou(long hearYou) { this.hearYou = hearYou; }

    public long getFeltThisToo() { return feltThisToo; }
    public void setFeltThisToo(long feltThisToo) { this.feltThisToo = feltThisToo; }

    public long getThankYou() { return thankYou; }
    public void setThankYou(long thankYou) { this.thankYou = thankYou; }

    public long getSendingSupport() { return sendingSupport; }
    public void setSendingSupport(long sendingSupport) { this.sendingSupport = sendingSupport; }
}
