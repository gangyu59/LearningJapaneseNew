// static/js/main.js
document.getElementById("generateBtn").addEventListener("click", async () => {
    const userInput = document.getElementById("userInput").value;
    const userRole = document.getElementById("role").value;
    const rate = parseFloat(document.getElementById("rate").value);
    const pitch = parseFloat(document.getElementById("pitch").value);

    if (!userInput.trim()) {
        alert("请输入对话场景！");
        return;
    }

    document.getElementById("output").innerHTML = "正在生成，请稍候...";

    try {
        console.log("📡 请求 GPT 生成对话:", userInput, userRole);
        const response = await fetchGPTResponse(userInput, userRole);
        console.log("🤖 GPT 生成的对话:", response);

        if (!response || typeof response !== "string" || response.trim() === "") {
            throw new Error("GPT 返回的对话为空！");
        }

        displayFormattedResponse(response);

        // **加载语音后再朗读**
        loadVoices(() => {
            console.log("🔊 语音加载完成，准备朗读");
            readTextAloudWithOptions(response, rate, pitch, 0);
        });

    } catch (error) {
        console.error("❌ 生成失败，错误详情:", error);
        document.getElementById("output").innerHTML = "生成失败，请检查 API Key 或网络连接。";
    }
});

// 绑定“朗读”按钮事件
document.getElementById("readText").addEventListener("click", () => {
    const text = document.getElementById("output").innerText;
    const rate = parseFloat(document.getElementById("rate").value);
    const pitch = parseFloat(document.getElementById("pitch").value);

    if (!text.trim()) {
        alert("没有文本可朗读，请先生成对话！");
        return;
    }

    readTextAloudWithOptions(text, rate, pitch, 0);
});

// 绑定“跟读”按钮，启动跟读功能
document.getElementById("startDictation").addEventListener("click", () => {
    console.log("🎤 启动跟读模式...");
    startDictationPractice();  // 调用 speech.js 里的函数
});

// 语音朗读控制：设置语速和音色
document.getElementById("rate").addEventListener("change", function () {
    const rate = parseFloat(this.value);
    const pitch = parseFloat(document.getElementById("pitch").value);
    readTextAloudWithOptions(document.getElementById("output").innerText, rate, pitch, 0);
});

document.getElementById("pitch").addEventListener("change", function () {
    const pitch = parseFloat(this.value);
    const rate = parseFloat(document.getElementById("rate").value);
    readTextAloudWithOptions(document.getElementById("output").innerText, rate, pitch, 0);
});

// **初始化语音**
loadVoices(() => {
    console.log("✅ 语音加载完成，检查可用语音");

    if (voices.length === 0) {
        console.error("❌ 没有找到可用语音！");
        return;
    }

    console.log("✅ 可用的日语语音:", voices.filter(v => v.lang.startsWith("ja-JP")).map(v => v.name));

    // 选择测试语音
    const testVoice = getVoiceForRole(0);
    console.log("🎙 选择的测试语音:", testVoice ? testVoice.name : "未找到");

    if (testVoice) {
        const utterance = new SpeechSynthesisUtterance("こんにちは！音声テスト中です。");
        utterance.voice = testVoice;
        speechSynthesis.speak(utterance);
    }
});

// 绑定场景按钮
bindSceneButtons();