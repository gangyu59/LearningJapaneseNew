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