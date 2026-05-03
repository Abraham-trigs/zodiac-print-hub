import { stockProjectionService } from "@lib/server/services/stock-projection.service";

export const stockEventHandler = async (event: any) => {
  if (
    event.type !== "stock.movement_created" &&
    event.type !== "stock.item_registered"
  )
    return;

  const stockItemId =
    event.payload?.movement?.stockItemId ?? event.payload?.item?.id;

  if (!stockItemId) return;

  await stockProjectionService.rebuildStockItem(event.orgId, stockItemId);
};
