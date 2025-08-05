export const updateTargets = (targetIds: string[]) => {
  canvas?.tokens?.setTargets(targetIds);
};

export const itemUse = async (itemUUID: string, params: object) => {
    const item: Item.Known | null = await fromUuid(itemUUID);
    void item?.use(params);
}