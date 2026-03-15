// функция расчёта
function calculateTotal(data) {
    let total = 0;
    if (data.kitchenCondition === "new") {
        total = calculateTotalForNewKitchen(data).price;
    } else if (data.kitchenCondition === "used") {
        total = calculateTotalForUsedKitchen(data).price;
  }
 return { price: total };
}

function calculateTotalForUsedKitchen(data) {
    let total = 0;

  // Базовая цена для I-Form до 5 шкафов
  const basePrice = 390;
  total += basePrice;

  // Забор столешницы из магазина
  if (data.worktopPickup === "yes") {
    total += 60;
  }

  // Подгонка столешницы
  if (data.worktopAdjust === "yes") {
    if (data.kitchenType === "l-form") {
      // L-Form: подгонка и зарезка
      total += 190;
    } else {
      // I-Form (zeile): обычная подгонка
      total += 95;
    }
  }
 return { price: total };

}


function calculateTotalForNewKitchen(data) {
  let total = 0;

  if (data.assembly === "yes") {
    total += calculateCabinetAssembly(data);
  }

  const basePrice = 390;
  total += basePrice;

  // Забор столешницы из магазина
  if (data.worktopPickup === "yes") {
    total += 60;
  }

  // Подгонка столешницы
  if (data.worktopAdjust === "yes") {
    if (data.kitchenType === "l-form") {
      // L-Form: подгонка и зарезка
      total += 190;
    } else {
      // I-Form (zeile): обычная подгонка
      total += 95;
    }
  }
 return { price: total };
}

// функция расчёта сборки шкафов
function calculateCabinetAssembly(data) {
  let total = 0;
  
  // Маленькие шкафы (без ящиков): 10€ каждый
  if (data.smallCabinets) {
    total += parseInt(data.smallCabinets) * 10;
  }
  
  // Большие шкафы (без ящиков): 15€ каждый
  if (data.largeCabinets) {
    total += parseInt(data.largeCabinets) * 15;
  }
  
  // Ящики: 6€ каждый
  if (data.drawers) {
    total += parseInt(data.drawers) * 6;
  }
  
  return total;
}


// экспортируем функцию
module.exports = { calculateTotal, calculateCabinetAssembly };