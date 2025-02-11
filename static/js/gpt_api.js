// 📌 解析 GPT 生成的日语对话
function parseDialogue(gptResponse) {
    if (!gptResponse) return [];

    // 🔹 按换行符分割文本，并去掉空行
    let lines = gptResponse.split("\n").map(line => line.trim()).filter(line => line.length > 0);

    // 🔹 提取每一句对话
    let dialogueArray = lines.map(line => {
        let parts = line.split(":");
        if (parts.length >= 2) {
            return { speaker: parts[0].trim(), japanese: parts[1].trim() };
        }
        return null;
    }).filter(item => item !== null);

    console.log("✅ 解析出的对话:", dialogueArray);
    return dialogueArray;
}

async function fetchGPTResponse(prompt, userRole) {
    const messages = [
        { 
            role: "system", 
            content: `你是一个日语老师。请根据用户的身份生成对话。例如，如果用户是"顾客"，那么请让GPT 以"服务员"的身份回复；如果用户是"学生"，请让GPT 以"老师"的身份回复；如果用户是"患者"，请让GPT 以"医生"的身份回复，等等。确保每句话后面都有中文翻译。\n\n
            另外，请在对话中 **随机选择 3-5 个生词**（关键单词），用"【】"括起来，例如：\n\n
            顾客: こんにちは！【天気】がいいですね！（你好！天气真好！）\n
            店员: はい、【気温】もちょうどいいです！（是的，气温也刚刚好！）\n\n
            这些生词稍后会提供详细解释。`
        },
        { 
            role: "user", 
            content: `用户的角色：${userRole}。\n请根据以下场景生成对话，并标记生词：\n\n${prompt}`
        }
    ];

    try {
        const response = await fetch('https://gpt4-111-us.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2024-02-01', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': '84fba46b577b46f58832ef36527e41d4' // ⚠️ 替换为你的 API Key
            },
            body: JSON.stringify({
                model: "gpt-4o",  // 你的 Azure OpenAI 部署名
                messages: messages,
                max_tokens: 1000,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            console.error("Error fetching data from GPT:", response.status, response.statusText);
            throw new Error('API 请求失败');
        }

        const data = await response.json();

        // 🆕 处理 API 响应
				// 🆕 处理 API 响应
		if (data.choices && data.choices.length > 0 && data.choices[0].message) {
		    const gptResponse = data.choices[0].message.content;
		
		    // ✅ 解析 GPT 生成的对话
		    const dialogueArray = parseDialogue(gptResponse);
		
		    // ✅ 存入 localStorage，确保跟读模式可以找到
		    if (dialogueArray && dialogueArray.length > 0) {
		        localStorage.setItem("speechDictationTask", JSON.stringify({ dialogue: dialogueArray }));
		        console.log("✅ 对话已存储到 localStorage:", dialogueArray);
		    } else {
		        console.warn("⚠️ GPT 生成的对话为空，未存入 localStorage！");
		    }
		
		    return gptResponse;
		} else {
		    console.error("Unexpected API response:", data);
		    return "生成失败，API 响应格式异常。";
		}

    } catch (error) {
        console.error("fetchGPTResponse error:", error);
        return "生成失败，请检查网络连接。";
    }
}

async function fetchWordMeaning(word) {
    const messages = [
        { role: "system", content: "你是一个日语老师，请解释以下日语单词，并给出例句。" },
        { role: "user", content: `请解释日语单词：${word}` }
    ];

    try {
        const response = await fetch('https://gpt4-111-us.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2024-02-01', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': '84fba46b577b46f58832ef36527e41d4'
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: messages,
                max_tokens: 200,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            console.error("Error fetching word meaning:", response.status, response.statusText);
            return "无法获取单词解释。";
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error("fetchWordMeaning error:", error);
        return "获取单词解释失败，请检查网络。";
    }
}
