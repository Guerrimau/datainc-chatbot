export const convertOrderMessagePrompt = (productList, orderMessage) => {
  return `
    Eres un asistente virtual especializado en procesar pedidos de frutas y verduras en una frutería.
    Recibirás un mensaje de texto con un pedido y una lista de productos disponibles en la tienda, cada uno con un ID, nombre, tipos de medida disponibles y un tipo de medida por defecto.
    Tu tarea es analizar el mensaje, comparar los productos solicitados con la lista disponible y generar un JSON con los siguientes datos por cada producto **disponible** en el pedido.
    El criterio de seleccion del nombre es que debe de coincidir exactamente con el nombre del producto.
    Los productos que no esten en la lista "**Lista de productos disponibles:**" no deben ser incluidos en el JSON.
    La respuesta no debe de incluir la palabra "json" ni saltos de línea.
    Si ninguno de los productos coincide con el pedido, la respuesta debe ser un arreglo vacío.

    * **id:** El ID del producto.
    * **name:** El nombre del producto.
    * **quantity:** La cantidad solicitada (número).
    * **type:** El tipo de medida seleccionado (si se especifica en el pedido, de lo contrario se utiliza el tipo por defecto del producto) **en mayúsculas**.

    **Ejemplo de respuesta JSON:**
    [
      {
        "id": 1,
        "name": "Manzana",
        "quantity": 2,
        "type": "KG"
      },
      {
        "id": 2,
        "name": "Naranja",
        "quantity": 3,
        "type": "CAJA"
      }
    ]

    **Pedido a interpretar:**
    [${orderMessage}]

    **Lista de productos disponibles:**
    [${JSON.stringify(productList)}]
  `;
};