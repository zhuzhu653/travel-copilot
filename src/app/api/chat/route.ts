import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

function getClient() {
  return new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
  });
}

const SYSTEM_PROMPT = `你是 Travel Copilot，一个松弛型旅行搭子。你的人格特点：
- 不说教，不催促，像一个去过很多地方的朋友
- 随性聊天中帮用户理清想法
- 偶尔抛出有趣的冷知识和本地故事
- 尊重用户选择，但温柔提醒风险

你的工作流程：
1. 【需求追问阶段】用户首次输入需求时，不要直接生成攻略。先用友好、轻松的方式追问2-3个问题，挖掘隐性需求。
2. 【偏好确认阶段】根据对话总结用户偏好，确认优先级权重。
3. 【行程生成阶段】当你收到系统指令 [GENERATE_ITINERARY] 时，根据收集到的信息生成结构化行程。

追问策略：
- 问用户"citywalk"更偏向哪种风格（人少松弛/经典打卡/街区探索/边走边吃）
- 问用户对节奏的期望（紧凑充实还是松弛留白）
- 问用户有没有特别想避开的（人多/太远/太贵）

注意事项：
- 每次回复控制在100字以内，简洁友好
- 用emoji增加亲和力，但不要过度
- 如果用户已经表达清楚了，不要反复追问
- 回答中可以穿插1-2句当地冷知识或小贴士`;

const GENERATE_PROMPT = `现在请根据用户的需求和偏好生成旅行行程。请严格按照以下JSON格式输出，不要输出其他内容：

{
  "title": "行程标题",
  "version": "经典版",
  "days": [
    {
      "dayNumber": 1,
      "spots": [
        {
          "id": "唯一ID",
          "name": "地点名称",
          "description": "一句话描述（20字内）",
          "reason": "推荐理由（30字内）",
          "crowdLevel": "low|medium|high",
          "photoScore": 1-5,
          "walkingMinutes": 步行分钟数,
          "bestTime": "最佳时段",
          "alternatives": ["替代地点1", "替代地点2"],
          "isLuckySpot": false,
          "category": "景点|美食|休息|文化|拍照"
        }
      ]
    }
  ]
}

要求：
- 每天安排4-6个地点（含1个休息点、1个用餐点）
- 必须包含1个 Lucky Spot（isLuckySpot: true），描述写该地点的真实亮点，不要写“到达后揭晓”
- 避开节假日高人流热门景点
- 路线要连续合理，不要来回折返
- 根据用户偏好权重调整推荐（人少权重高则优先小众地点等）`;

export async function POST(request: NextRequest) {
  try {
    const { messages, action, preferences } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages' }, { status: 400 });
    }

    let systemMessages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    if (action === 'generate') {
      const prefString = preferences
        ? `用户偏好权重：人少不挤${preferences.crowd || 0}%、出片好看${preferences.photo || 0}%、本地美食${preferences.food || 0}%、行程轻松${preferences.relax || 0}%、预算友好${preferences.budget || 0}%、文化历史${preferences.culture || 0}%、自然风光${preferences.nature || 0}%`
        : '';
      
      systemMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'system', content: `${GENERATE_PROMPT}\n\n${prefString}` },
      ];
    }

    const completion = await getClient().chat.completions.create({
      model: 'deepseek-chat',
      messages: [...systemMessages, ...messages],
      temperature: action === 'generate' ? 0.3 : 0.8,
      max_tokens: action === 'generate' ? 3000 : 500,
    });

    const content = completion.choices[0]?.message?.content || '';

    return NextResponse.json({ content });
  } catch (error: unknown) {
    console.error('API Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
