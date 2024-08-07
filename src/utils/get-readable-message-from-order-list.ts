export const getReadableMessageFromOrderList = (orderList) => {
  let message = `¡Gracias por tu pedido! 👋`
  orderList.forEach((item) => {
    message += `\n${item.name} - ${item.quantity} ${item.type}`
  });
  return message;
};