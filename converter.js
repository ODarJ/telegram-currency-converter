const tg = window.Telegram.WebApp;

// Initialize Telegram Web App
tg.expand();
tg.enableClosingConfirmation();

// Show back button
tg.BackButton.show();
tg.BackButton.onClick(() => {
    tg.close();
});

// DOM elements
const amountInput = document.getElementById('amount');
const rateInput = document.getElementById('rate-input');
const baseAmountInput = document.getElementById('base-amount');
const resultElement = document.getElementById('result');
const calculationElement = document.getElementById('calculation');
const historyList = document.getElementById('history-list');
const userGreeting = document.getElementById('user-greeting');

let calculationHistory = [];

// Set user greeting
if (tg.initDataUnsafe.user) {
    const user = tg.initDataUnsafe.user;
    userGreeting.textContent = `မင်္ဂလာပါ ${user.first_name}! သင့်ငွေကြေးကို ပေါက်ဈေးဖြင့် တွက်ချက်ပေးမည်`;
}

// Auto-calculate when inputs change
[amountInput, rateInput, baseAmountInput].forEach(input => {
    input.addEventListener('input', calculateConversion);
});

function calculateConversion() {
    const amount = parseFloat(amountInput.value);
    const rate = parseFloat(rateInput.value);
    const baseAmount = parseFloat(baseAmountInput.value);
    
    if (!amount || !rate || !baseAmount) {
        resultElement.textContent = 'ကျေးဇူးပြု၍ အားလုံးဖြည့်ပါ';
        calculationElement.textContent = '';
        tg.MainButton.hide();
        return;
    }
    
    if (baseAmount === 0) {
        resultElement.textContent = 'ပေါက်ဈေး (ကျပ်) ကို 0 မထားပါနဲ့';
        calculationElement.textContent = '';
        tg.MainButton.hide();
        return;
    }
    
    // Calculate result
    const result = (amount * rate) / baseAmount;
    
    // Display result
    resultElement.textContent = `ရလဒ်: ${formatNumber(result)} ဘတ်`;
    
    // Show calculation steps
    calculationElement.innerHTML = 
        `<div class="calculation-steps">
            <div>တွက်ချက်ပုံ: </div>
            <div>(${formatNumber(amount)} × ${formatNumber(rate)}) ÷ ${formatNumber(baseAmount)} = ${formatNumber(result)}</div>
            <div class="explanation">
                ${formatNumber(amount)} ကျပ် အတွက် ${formatNumber(result)} ဘတ် ရမည်
            </div>
        </div>`
    ;
    
    // Add to history
    addToHistory(amount, baseAmount, rate, result);
    
    // Update Telegram Main Button
    updateTelegramButton(result);
}

function addToHistory(amount, baseAmount, rate, result) {
    const historyItem = {
        amount: amount,
        baseAmount: baseAmount,
        rate: rate,
        result: result,
        timestamp: new Date().toLocaleTimeString('my-MM')
    };
    
    calculationHistory.unshift(historyItem);
    calculationHistory = calculationHistory.slice(0, 5);
    
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    historyList.innerHTML = '';
    
    calculationHistory.forEach((item) => {
        const historyElement = document.createElement('div');
        historyElement.className = 'history-item';
        historyElement.innerHTML = 
            `<div class="history-main">
                ${formatNumber(item.amount)} ကျပ် = ${formatNumber(item.result)} ဘတ်
            </div>
            <div class="history-details">
                ပေါက်ဈေး: ${formatNumber(item.baseAmount)} = ${formatNumber(item.rate)} ဘတ်
                <span class="history-time">${item.timestamp}</span>
            </div>`
        ;
        historyList.appendChild(historyElement);
    });
}

function updateTelegramButton(result) {
    const amount = amountInput.value;
    tg.MainButton.setText(`💱 ${formatNumber(result)} ဘတ်`)
        .show()
        .onClick(() => {
            shareResult(amount, result);
        });
}

function shareResult(amount, result) {
    const shareText =`💱 ငွေကြေးပြောင်းလဲမှု: ${formatNumber(amount)} ကျပ် = ${formatNumber(result)} ဘတ်`;
    
    if (tg.isVersionAtLeast('6.1')) {
        tg.shareUrl({
            url: window.location.href,
            text: shareText
        });
    } else {
        tg.showAlert(shareText);
    }
}
function formatNumber(num) {
    return new Intl.NumberFormat('my-MM').format(num);
}

// Initialize with example values
function initializeApp() {
    amountInput.value = 200000;
    rateInput.value = 780;
    baseAmountInput.value = 100000;
    calculateConversion();
}

// Handle theme changes
tg.onEvent('themeChanged', updateTheme);
function updateTheme() {
    document.body.style.background = tg.themeParams.bg_color || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
}

// Initialize when ready
tg.ready();
initializeApp();