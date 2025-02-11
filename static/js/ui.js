// static/js/ui.js

function displayFormattedResponse(text) {
    console.log("🚀 displayFormattedResponse 被调用"); // **确认函数是否被执行**
 //   console.log("📜 原始文本:", text); 

    const lines = text.split("\n");
    let formattedHtml = "<p><strong>对话内容：</strong></p>";
    let vocabList = [];

    lines.forEach(line => {
        if (line.includes("：")) {
            const parts = line.split("：");
            if (parts.length === 2) {
                const highlightedText = parts[1].replace(/【([^】]+)】/g, function (match, word) {
                    vocabList.push(word.trim());
                    return `<span style="background-color: yellow;">${word.trim()}</span>`;
                });

                formattedHtml += `<p><strong>${parts[0]}:</strong> ${highlightedText}</p>`;
            } else {
                formattedHtml += `<p>${line}</p>`;
            }
        } else {
            formattedHtml += `<p>${line}</p>`;
        }
    });

//    console.log("📌 生成的生词列表:", vocabList);
//    console.log(`📌 找到 ${vocabList.length} 个生词`);

    document.getElementById("output").innerHTML = formattedHtml;
}

// ✅ 绑定生词的点击 & 触摸事件
function bindVocabClickEvents() {
    console.log("✅ 正在执行 bindVocabClickEvents()...");

    setTimeout(() => {
        const vocabElements = document.querySelectorAll(".vocab");
        console.log(`📌 找到 ${vocabElements.length} 个生词`);

        vocabElements.forEach(word => {
            word.style.backgroundColor = "lightgoldenrodyellow"; // **浅黄色高亮**
            word.style.padding = "2px 4px";
            word.style.borderRadius = "4px";
            word.style.cursor = "pointer";
            word.style.userSelect = "none"; // 禁止 iPhone 选中文字

            word.addEventListener("click", function () {
                handleVocabTouch(this);
            });

            word.addEventListener("touchstart", function () {
                handleVocabTouch(this);
            });
        });
    }, 500); // **🆕 延迟绑定，确保生词渲染完成**
}

// ✅ 处理触摸事件
async function handleVocabTouch(element) {
    const vocabWord = element.textContent.trim();
    console.log(`📌 触摸生词: ${vocabWord}`);

    const meaning = await fetchWordMeaning(vocabWord);

    if (!meaning) {
        console.warn(`⚠️ 没找到 "${vocabWord}" 的解释`);
        return;
    }

    showPopup(vocabWord, meaning);
}

// ✅ 词典数据（模拟）
async function fetchWordMeaning(word) {
    console.log(`🔍 查找 "${word}" 的解释...`);

    const mockDictionary = {
        "靴": "鞋子",
        "駅": "车站",
        "名所": "名胜",
        "コンビニ": "便利店",
        "和菓子": "日式点心",
        "観光": "观光，旅游"
    };

    return mockDictionary[word] || "暂无解释";
}

// ✅ 新版 `popup`：信息浓缩、弹窗更宽、字体更小
function showPopup(title, content) {
    // 先删除已有的弹窗，防止重复
    let existingPopup = document.querySelector(".popup");
    if (existingPopup) existingPopup.remove();

    // **📌 处理内容浓缩**
    let condensedContent = condenseContent(content);

    // 创建 `popup`
    let popup = document.createElement("div");
    popup.className = "popup";
    popup.innerHTML = `
        <div class="popup-header">
            <strong>${title}</strong>
            <button class="popup-close">✖</button>
        </div>
        <div class="popup-content">${condensedContent}</div>
    `;

    document.body.appendChild(popup);

    // ✅ 绑定关闭按钮
    popup.querySelector(".popup-close").addEventListener("click", closePopup);

    // ✅ 点击 `popup` 外部区域关闭
    setTimeout(() => {
        document.addEventListener("click", closePopupOnOutsideClick);
    }, 100);
}

// ✅ 关闭 `popup`
function closePopup() {
    let popup = document.querySelector(".popup");
    if (popup) popup.remove();
    document.removeEventListener("click", closePopupOnOutsideClick);
}

// ✅ 点击 `popup` 外部关闭
function closePopupOnOutsideClick(event) {
    let popup = document.querySelector(".popup");
    if (popup && !popup.contains(event.target)) {
        closePopup();
    }
}

// ✅ **浓缩信息，删掉不必要的细节**
function condenseContent(content) {
    // 只保留 **单词解析 & 语法总结**
    return content.replace(/详细解释.+/, "").replace(/示例句子:.+/g, "");
}

// ✅ 绑定预设场景按钮
function bindSceneButtons() {
    document.querySelectorAll(".sceneBtn").forEach(button => {
        button.addEventListener("click", () => {
            document.getElementById("userInput").value = button.textContent;
        });
    });
}