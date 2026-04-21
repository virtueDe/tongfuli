import { Button, Text, View } from "@tarojs/components";
import Taro, { useRouter } from "@tarojs/taro";

const SHARE_TOPICS: Record<
  string,
  {
    title: string;
    summary: string;
    question: string;
  }
> = {
  "laobai-fear-chain": {
    title: "老白到底怕谁",
    summary: "怕掌柜只是表面，背后还有身份压力、旧事阴影和对安稳生活的执念。",
    question: "原剧模式下，老白最怕的到底是佟掌柜还是自己的过去？",
  },
  "shopkeeper-power-balance": {
    title: "佟掌柜为什么总能压住全场",
    summary: "她不是简单会说，而是总能在账本、人情和危机里找到那个稳住局面的点。",
    question: "佟掌柜最能拿捏老白的三个瞬间分别是什么？",
  },
  "furong-chaos-energy": {
    title: "郭芙蓉的混乱能量从哪来",
    summary: "把侠气、委屈、不服气和成长放一起看，她的爆冲就没那么单薄了。",
    question: "用郭芙蓉的口吻，总结她在客栈里最不服的三件事。",
  },
};

export default function SharePage() {
  const router = useRouter();
  const slug = router.params.slug ?? "laobai-fear-chain";
  const topic = SHARE_TOPICS[slug] ?? SHARE_TOPICS["laobai-fear-chain"];

  return (
    <View style={styles.page}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Tongfuli / Share</Text>
        <Text style={styles.title}>{topic.title}</Text>
        <Text style={styles.summary}>{topic.summary}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>推荐追问</Text>
        <Text style={styles.quote}>{topic.question}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>分享承接说明</Text>
        <Text style={styles.summary}>
          这版先承接分享入口，把用户导回主对话页继续追问；下一步再补带参数回流。
        </Text>
      </View>

      <Button style={styles.primaryButton} onClick={() => Taro.navigateBack({ delta: 1 })}>
        返回主对话页
      </Button>
    </View>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    backgroundColor: "#f6efe5",
  },
  hero: {
    backgroundColor: "#fff9f0",
    borderRadius: "24px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  eyebrow: {
    color: "#9d3d2f",
    fontSize: "12px",
    fontWeight: "700",
  },
  title: {
    color: "#2b2119",
    fontSize: "24px",
    fontWeight: "700",
  },
  summary: {
    color: "#5f544b",
    lineHeight: "1.7",
  },
  card: {
    backgroundColor: "#fffdf8",
    borderRadius: "20px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  label: {
    color: "#9d3d2f",
    fontSize: "14px",
    fontWeight: "700",
  },
  quote: {
    color: "#2b2119",
    lineHeight: "1.8",
    paddingLeft: "12px",
    borderLeft: "4px solid #9d3d2f",
  },
  primaryButton: {
    backgroundColor: "#9d3d2f",
    color: "#fff",
    borderRadius: "999px",
  },
};
