import type { CharacterId, ConversationMode } from "@tongfuli/domain-sdk";

export interface TopicFeature {
  slug: string;
  title: string;
  summary: string;
  angle: string;
  shareTitle: string;
  shareExcerpt: string;
  sampleQuestion: string;
  suggestedCharacterId: CharacterId;
  suggestedMode: ConversationMode;
}

export const TOPIC_FEATURES: TopicFeature[] = [
  {
    slug: "shopkeeper-power-balance",
    title: "佟掌柜为什么总能压住全场",
    summary: "从客栈账本、人情往来和关键场面切进去，看她怎么把一屋子人拢住。",
    angle: "适合先补关系网，再追问谁在什么时候真正说了算。",
    shareTitle: "同福里专题：掌柜的场面控制术",
    shareExcerpt: "从账本、情面和危机处理三条线，看佟湘玉怎么稳住客栈。",
    sampleQuestion: "佟掌柜最能拿捏老白的三个瞬间分别是什么？",
    suggestedCharacterId: "char_tongxiangyu",
    suggestedMode: "extended",
  },
  {
    slug: "laobai-fear-chain",
    title: "老白到底怕谁",
    summary: "不是简单怕掌柜，而是一条会层层传导的压力链：银子、身份、感情和旧事。",
    angle: "适合用原剧模式追因果，再切娱乐模式玩梗吐槽。",
    shareTitle: "同福里专题：老白的怕字经",
    shareExcerpt: "怕掌柜、怕过去、怕失去安稳，老白的每次退让都不是一回事。",
    sampleQuestion: "原剧模式下，老白最怕的到底是佟掌柜还是自己的过去？",
    suggestedCharacterId: "char_baizhantang",
    suggestedMode: "canon",
  },
  {
    slug: "furong-chaos-energy",
    title: "郭芙蓉的混乱能量从哪来",
    summary: "把她的嘴硬、侠气、冲动和成长放在一起看，会更容易读懂那些名场面。",
    angle: "适合直接切她的口吻，让回答带点冲劲。",
    shareTitle: "同福里专题：郭芙蓉的爆冲名场面",
    shareExcerpt: "她不是只会吵，她是把委屈、侠气和不服气一起扔出来。",
    sampleQuestion: "用郭芙蓉的口吻，总结她在客栈里最不服的三件事。",
    suggestedCharacterId: "char_guofurong",
    suggestedMode: "fun",
  },
];

export function findTopicBySlug(slug: string): TopicFeature | undefined {
  return TOPIC_FEATURES.find((item) => item.slug === slug);
}
