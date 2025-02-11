let voices = []; // 存储语音列表

// 🔄 **确保语音已加载**
function loadVoices(callback) {
    voices = speechSynthesis.getVoices();

    if (voices.length > 0) {
    //    console.log("✅ 语音列表加载完成:", voices.map(v => v.name));
        callback();
        return;
    }

    speechSynthesis.onvoiceschanged = () => {
        voices = speechSynthesis.getVoices();
        console.log("🔄 语音列表更新完成:", voices.map(v => v.name));
        callback();
    };

    // **手动触发一次加载（防止 Safari 限制）**
    setTimeout(() => {
        voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
            console.log("✅ 语音最终加载:", voices.map(v => v.name));
            callback();
        } else {
            console.error("❌ 语音仍未加载，可能受 Safari 限制！");
        }
    }, 2000);
}

function getVoiceForRole(roleIndex) {
    if (!voices || voices.length === 0) {
        console.error("❌ 语音列表为空，无法选择角色语音！");
        return null;
    }

    // ✅ **筛选所有日语语音**
    const japaneseVoices = voices.filter(v => v.lang === "ja-JP");

    if (japaneseVoices.length === 0) {
        console.error("❌ 没有可用的日语语音！");
        return null;
    }

    console.log("✅ 可用的日语语音:", japaneseVoices.map(v => v.name));

    // ✅ **强制角色 0 使用 Kyoko，角色 1 使用 Reed**
    const femaleVoice = japaneseVoices.find(v => v.name.includes("Kyoko"));
    const maleVoice = japaneseVoices.find(v => v.name.includes("Reed"));

    if (!femaleVoice || !maleVoice) {
        console.error("❌ Kyoko 或 Reed 语音丢失，检查 Safari 是否正确加载语音！");
        return null;
    }

    // ✅ **固定角色语音**
    if (roleIndex % 2 === 0) {
        console.log(`🎙 角色 ${roleIndex} 选择女声: ${femaleVoice.name}`);
        return femaleVoice;
    } else {
        console.log(`🎙 角色 ${roleIndex} 选择男声: ${maleVoice.name}`);
        return maleVoice;
    }
}

function readTextAloudWithOptions(text, rate, pitch, roleIndex) {
    if (!text.trim()) return;

    let japaneseText = text
        .replace(/生成的日语对话：/g, '')
        .replace(/(\S+):/g, '')
        .replace(/【(.*?)】/g, '$1')
        .replace(/（.*?）/g, '')
        .trim();

    console.log("🔊 朗读内容:", japaneseText);
    window.speechSynthesis.cancel();

    // **获取语音**
    const voice = getVoiceForRole(roleIndex);
    if (!voice) {
        console.error("❌ 没有找到合适的语音，朗读终止！");
        return;
    }

    const utterance = new SpeechSynthesisUtterance(japaneseText);
    utterance.lang = 'ja-JP';
    utterance.voice = voice;
    utterance.rate = rate;
    utterance.pitch = pitch;

    console.log(`🗣 朗读角色 ${roleIndex} 语音: ${utterance.voice ? utterance.voice.name : "未设置"}`);

    // **防止 Safari 忽略 voice**
    setTimeout(() => {
        window.speechSynthesis.speak(utterance);
    }, 100);
}

// 🎤 **开始语音识别（跟读功能）**
function startDictation() {
    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'ja-JP';
    recognition.start();

    recognition.onresult = function (event) {
        const userSpeech = event.results[0][0].transcript;
        alert("你说了：" + userSpeech);
    };
}

// 📋 **列出所有可用语音**
function listAvailableVoices() {
    voices = speechSynthesis.getVoices();
    voices.forEach(voice => console.log(`${voice.name} (${voice.lang})`));
}

let cachedDialogue = null;  // ✅ 用于存储对话
let dialogueData = [];  // 存储当前对话数据
let currentIndex = 0;   // 当前朗读的句子索引

function saveDialogueToCache(dialogue) {
    cachedDialogue = { dialogue };  // ✅ 以对象形式存储
    console.log("✅ 对话已存入缓存:", cachedDialogue);
}

function getDialogueFromCache() {
    if (!cachedDialogue) {
        console.warn("❌ 没有找到对话数据！");
        alert("请先生成对话！");
        return null;
    }
    console.log("📖 读取缓存中的对话:", cachedDialogue);
    return cachedDialogue;
}

// ✅ 开始跟读
function startDictationPractice() {
    currentIndex = 0;
    const storedData = localStorage.getItem("speechDictationTask");
		
alert(storedData);  // 弹窗显示存储的数据

    if (!storedData) {
        console.warn("❌ 没有找到对话数据！");
        alert("请先生成对话！");
        return;
    }

    dialogueData = JSON.parse(storedData).dialogue;
    if (!dialogueData || dialogueData.length === 0) {
        console.error("❌ 对话数据为空！");
        alert("获取对话失败！");
        return;
    }

    console.log("🎯 练习开始，朗读第 1 句...");
    highlightSentence(currentIndex); // 高亮第一句
    playDictationSentence(dialogueData[currentIndex].japanese);
}


// ✅ 高亮当前朗读的句子
function highlightSentence(index) {
    let dialogueElements = document.querySelectorAll(".generated-dialogue p");
    dialogueElements.forEach((el, i) => {
        el.style.backgroundColor = i === index ? "yellow" : "transparent";  // 仅高亮当前句子
    });
}

function playDictationSentence(sentence) {
    if (!sentence) return;

    let japaneseText = sentence.replace(/（.*?）/g, "").trim();

    if (speechSynthesis.speaking) {
        console.warn("⏳ 朗读任务未完成，跳过新任务...");
        return;
    }

    let utterance = new SpeechSynthesisUtterance(japaneseText);
    utterance.lang = "ja-JP";
    utterance.rate = 0.9;

    // **✅ 强制选择日语语音**
    let voices = speechSynthesis.getVoices();
    let japaneseVoice = voices.find(voice => voice.name.includes("Kyoko")); // iOS Safari 默认的日语语音
    if (japaneseVoice) {
        utterance.voice = japaneseVoice;
        console.log(`🎙 使用日语语音: ${japaneseVoice.name}`);
    } else {
        console.warn("⚠️ 未找到日语语音，使用默认语音");
    }

    console.log(`🔊 朗读: ${japaneseText}`);

    utterance.onend = function() {
        console.log("✅ 朗读结束，等待用户复述...");
        setTimeout(() => {
            startSpeechRecognition();
        }, 500);  // 🔹 增加短暂延迟，确保语音识别正确启动
    };

    speechSynthesis.speak(utterance);
}

// ✅ 语音识别（用户复述）
function startSpeechRecognition() {
    if (!("webkitSpeechRecognition" in window)) {
        console.error("❌ 你的 Safari 浏览器不支持 SpeechRecognition！");
        alert("⚠️ 请使用 iOS Safari，并确保麦克风权限已开启！");
        return;
    }

    let recognition = new webkitSpeechRecognition();
    recognition.lang = "ja-JP"; // 识别日语
    recognition.continuous = false; // 仅识别一次
    recognition.interimResults = false; // 仅返回最终结果
    recognition.maxAlternatives = 1;

    recognition.onstart = function() {
        console.log("🎤 语音识别已启动...");
    };

    recognition.onspeechend = function() {
        console.log("✅ 语音输入结束，停止识别...");
        recognition.stop();
    };

    recognition.onresult = function(event) {
        let userSpeech = event.results[0][0].transcript;
        console.log("🎙️ 用户复述:", userSpeech);
        checkSpeechDictation(userSpeech);
    };

    recognition.onerror = function(event) {
        console.error("❌ 语音识别错误:", event.error);
        
        // 处理用户拒绝麦克风权限的问题
        if (event.error === "not-allowed") {
            alert("❌ 语音识别被禁用！请前往 Safari 设置中开启麦克风权限！");
            return;
        }

        // 处理 service-not-allowed 错误，尝试重新启动识别
        if (event.error === "service-not-allowed") {
            console.warn("⚠️ 语音服务未授权，3 秒后重新尝试...");
            setTimeout(() => startSpeechRecognition(), 3000);
            return;
        }

        // 处理网络问题
        if (event.error === "network") {
            alert("❌ 网络错误，请检查网络连接后重试！");
            return;
        }

        alert("⚠️ 语音识别失败，请重试！");
    };

    recognition.start();
}

// ✅ 评估用户的跟读
async function checkSpeechDictation(userSpeech) {
    let correctSentence = dialogueData[currentIndex].japanese;

    const messages = [
        { role: "system", content: "你是一个日语老师，负责检查用户的口语练习。" },
        { role: "user", content: `请检查用户的口语复述：
        - **原句**: ${correctSentence}
        - **用户复述**: ${userSpeech}
        请判断是否正确，并返回评分：
        {
          "correct": true/false,
          "score": 0-10,
          "feedback": "你的发音准确/需要改进..."
        }`
        }
    ];

    try {
        const response = await fetchGPTResponse(messages);
        let result;
        
        // 处理 JSON 解析异常
        try {
            result = JSON.parse(response);
        } catch (parseError) {
            console.error("❌ JSON 解析失败，返回原始数据", response);
            alert("⚠️ 评分系统出错，请稍后重试！");
            return;
        }

        document.getElementById("speech-feedback").innerText = `🎯 评分: ${result.score}/10\n📝 反馈: ${result.feedback}`;

        if (result.correct) {
            console.log("🎉 口语复述正确！");
        } else {
            console.log("❌ 口语复述错误！", result.feedback);
        }

        // ✅ 继续下一句
        currentIndex++;
        if (currentIndex < dialogueData.length) {
            highlightSentence(currentIndex);
            setTimeout(() => {
                playDictationSentence(dialogueData[currentIndex].japanese);
            }, 1000);  // 🔹 增加 1 秒延迟，确保评分 UI 可见
        } else {
            console.log("🎯 练习结束！");
            alert("🎉 跟读完成！");
        }
    } catch (error) {
        console.error("❌ 解析口语反馈失败", error);
        alert("❌ 评分系统出错，请稍后再试！");
    }
}