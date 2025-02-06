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

// 🎙 **根据角色索引选择语音**
function getVoiceForRole(roleIndex) {
    if (!voices || voices.length === 0) {
        console.error("❌ 语音列表为空，无法选择角色语音！");
        return null;
    }

    const femaleVoice = voices.find(v => v.name.includes("Kyoko")) || voices[0]; 
    const maleVoice = voices.find(v => v.name.includes("Eddy")) || voices.find(v => v.name.includes("Rocko")) || voices.find(v => v.name.includes("Reed"))  || voices.find(v => v.name.includes("Flo"))  || voices[0];

    if (roleIndex % 2 === 0) {
        console.log(`🎙 选择女声: ${femaleVoice.name}`);
        return femaleVoice;
    } else {
        console.log(`🎙 选择男声: ${maleVoice ? maleVoice.name : "未找到，使用默认女声"}`);
        return maleVoice || femaleVoice;
    }
}

// 📢 **朗读文本**
function readTextAloudWithOptions(text, rate, pitch, roleIndex) {
    if (!text.trim()) return;

    // 清理文本（去除角色标签、生词标记、中文翻译）
    let japaneseText = text
        .replace(/生成的日语对话：/g, '')
        .replace(/(\S+):/g, '')
        .replace(/【(.*?)】/g, '$1')
        .replace(/（.*?）/g, '')
        .trim();

    // 🆕 **截断“生词解释”**
    const separatorIndex = japaneseText.indexOf("生词解释");
    if (separatorIndex !== -1) {
        japaneseText = japaneseText.substring(0, separatorIndex);
    }

    console.log("🔊 朗读内容:", japaneseText);
    window.speechSynthesis.cancel();

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

    console.log("🔊 即将朗读:", utterance);
    window.speechSynthesis.speak(utterance);
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

let dialogueData = [];  // 存储当前对话数据
let currentIndex = 0;   // 当前朗读的句子索引

// ✅ 开始跟读
function startDictationPractice() {
    currentIndex = 0;
    const storedData = localStorage.getItem("speechDictationTask");

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

// ✅ 朗读日语句子
function playDictationSentence(sentence) {
    if (!sentence) return;

    let utterance = new SpeechSynthesisUtterance(sentence);
    utterance.lang = "ja-JP";
    utterance.rate = 0.9;

    utterance.onend = function() {
        console.log("✅ 朗读结束，等待用户复述...");
        startSpeechRecognition(); // 启动语音识别
    };

    speechSynthesis.speak(utterance);
}

// ✅ 语音识别（用户复述）
function startSpeechRecognition() {
    let recognition = new webkitSpeechRecognition();
    recognition.lang = "ja-JP";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = function(event) {
        let userSpeech = event.results[0][0].transcript;
        console.log("🎙️ 用户复述:", userSpeech);
        checkSpeechDictation(userSpeech);
    };

    recognition.onerror = function(event) {
        console.error("❌ 语音识别错误:", event.error);
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
        let result = JSON.parse(response);

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
            playDictationSentence(dialogueData[currentIndex].japanese);
        } else {
            console.log("🎯 练习结束！");
            alert("🎉 跟读完成！");
        }
    } catch (error) {
        console.error("❌ 解析口语反馈失败", error);
    }
}