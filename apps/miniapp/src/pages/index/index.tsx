import { Button, Input, Text, View } from "@tarojs/components";

export default function IndexPage() {
  return (
    <View style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
      <Text style={{ fontSize: "20px", fontWeight: "700", color: "#7f2f21" }}>
        Tongfuli 小程序骨架
      </Text>
      <Text>这里优先承接轻量对话、热门角色入口和分享回流。</Text>
      <Input placeholder="直接问剧情、玩梗，或者切角色继续聊" />
      <Button type="primary" color="#9d3d2f">
        开始对话
      </Button>
    </View>
  );
}
