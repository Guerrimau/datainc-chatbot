export const getReadableMessageFromOrderList = (orderList) => {
  let message = `¡Gracias por tu pedido! 👋`
  orderList.forEach(item => {
    const name = item.name;
    const quantity = item.units || "Cantidad no especificada";
    const type = item.unitType || "Tipo no especificado";
    message += `\n${name} - ${quantity} ${type}`
  });
  return message;
};