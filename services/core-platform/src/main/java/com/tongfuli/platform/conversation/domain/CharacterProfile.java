package com.tongfuli.platform.conversation.domain;

import java.util.Arrays;

public enum CharacterProfile {
    BAI_ZHAN_TANG("char_baizhantang", "白展堂"),
    TONG_XIANG_YU("char_tongxiangyu", "佟湘玉"),
    GUO_FU_RONG("char_guofurong", "郭芙蓉");

    private final String id;
    private final String displayName;

    CharacterProfile(String id, String displayName) {
        this.id = id;
        this.displayName = displayName;
    }

    public String id() {
        return id;
    }

    public String displayName() {
        return displayName;
    }

    public static CharacterProfile fromId(String rawId) {
        return Arrays.stream(values())
            .filter(profile -> profile.id.equals(rawId))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("不支持的角色: " + rawId));
    }
}
