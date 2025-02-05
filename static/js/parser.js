// **📌 发送 GPT 请求，获取解析结果**
async function fetchGPTAnalysis(sentence) {
    console.log("📡 请求 GPT 解析:", sentence);
    const apiKey = "84fba46b577b46f58832ef36527e41d4"; // ⚠️ 替换成你的 API Key
    const url = "https://gpt4-111-us.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2024-02-01";

    const messages = [
        { role: "system", content: "你是一个日语语言专家，能解析日语句子，并按照 JSON 结构返回：" },
        { role: "user", content: `请解析以下日语句子：
        - **1️⃣ 分解为单词**（提供罗马拼音）
        - **2️⃣ 提供单词的词性和含义**
        - **3️⃣ 分析句子结构和语法**
        句子：${sentence}

        ⚠️ 请严格返回以下 JSON 格式：
        {
          "sentence": "原句",
          "words": [
            { "word": "单词", "romaji": "罗马拼音", "type": "词性", "meaning": "中文释义" },
            ...
          ],
          "grammar": "语法解析"
        }
        ` }
    ];

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api-key": apiKey
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: messages,
                max_tokens: 1000,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error("API 请求失败");
        }

        const data = await response.json();
        if (data.choices && data.choices.length > 0 && data.choices[0].message) {
            return processGPTOutput(data.choices[0].message.content.trim());
        } else {
            return null;
        }
    } catch (error) {
        console.error("fetchGPTAnalysis 错误:", error);
        return null;
    }
}

async function processGPTOutput(responseText) {
    console.log("📜 GPT 原始返回:", responseText); // 先查看完整内容

    try {
        // ✅ 确保 JSON 字符串不包含 Markdown 代码块
        let jsonString = responseText.trim();
        jsonString = jsonString.replace(/^```json\s*/, "").replace(/```$/, "");

        // ✅ 解析 JSON
        let jsonData = JSON.parse(jsonString);
//        console.log("✅ 解析后的 JSON 数据:", jsonData);

        return jsonData;
    } catch (error) {
        console.error("❌ JSON 解析失败:", error);
        return null;
    }
}

// **📌 结构化显示解析结果**
function showSentenceAnalysis(parsedData) {
    let popup = document.createElement("div");
    popup.className = "analysis-popup";

    // **📌 句子部分**
    let htmlContent = `
        <h2>📖 句子解析</h2>
        <p><strong>📌 句子：</strong> ${parsedData.sentence}</p>
        <hr>
    `;

    // **📌 单词解析**
    htmlContent += `<h3>📖 单词解析：</h3><table class="analysis-table">`;
    htmlContent += "<tr><th>单词</th><th>罗马拼音</th><th>词性</th><th>含义</th></tr>";
    parsedData.words.forEach(word => {
        htmlContent += `
            <tr>
                <td>${word.word}</td>
                <td>${word.romaji}</td>
                <td>${word.type || "未知"}</td>
                <td>${word.meaning || "未知"}</td>
            </tr>
        `;
    });
    htmlContent += "</table><hr>";

    // **📌 语法解析**
    htmlContent += `<h3>📖 语法分析：</h3><p>${parsedData.grammar}</p>`;

    // **📌 关闭按钮**
    htmlContent += `<button class="close-popup">❌ 关闭</button>`;

    popup.innerHTML = htmlContent;
    document.body.appendChild(popup);

    // **📌 绑定关闭事件**
    document.querySelector(".close-popup").addEventListener("click", () => {
        popup.remove();
    });
}

// 📌 显示 hourglass
function showHourglass() {
    let hourglass = document.getElementById("hourglass");
    if (!hourglass) {
        hourglass = document.createElement("div");
        hourglass.id = "hourglass";
        hourglass.className = "hourglass";
        hourglass.innerText = "⌛";
        document.body.appendChild(hourglass);
    }
    hourglass.style.display = "block";
}

// 📌 隐藏 hourglass
function hideHourglass() {
    let hourglass = document.getElementById("hourglass");
    if (hourglass) {
        hourglass.style.display = "none";
    }
}

// ✅ 监听双击事件（PC 端）
document.addEventListener("dblclick", async function(event) {
    let targetElement = event.target.closest("p, span"); // 仅限于点击段落或文字元素
    if (targetElement) {
        let selectedText = targetElement.innerText.trim(); // 直接获取句子
        console.log("🔍 解析句子:", selectedText);

        showHourglass(); // ⏳ 显示 hourglass

        let analysisResult = await fetchGPTAnalysis(selectedText);

        hideHourglass(); // ✅ 解析完成后隐藏 hourglass

        if (analysisResult) {
            showSentenceAnalysis(analysisResult);
        }
    }
});

// ✅ 监听双触屏事件（移动端）
document.addEventListener("touchend", async function(event) {
    let currentTime = new Date().getTime();
    let tapLength = currentTime - lastTouchTime;

    if (tapLength < 300 && tapLength > 0) {  // 300ms 内的第二次触摸视为双击
        let targetElement = event.target.closest("p, span"); // 只针对文本元素
        if (targetElement) {
            let selectedText = targetElement.innerText.trim(); // 获取整行文本
            console.log("🔍 解析句子:", selectedText);
            let analysisResult = await fetchGPTAnalysis(selectedText);
            if (analysisResult) {
                showSentenceAnalysis(analysisResult);
            }
        }
    }
    lastTouchTime = currentTime;
});