export const generateEntityId = async (Model, prefix) => {
    const lastDocument = await Model
        .findOne({
            entityId: { $regex: `^${prefix}-` }
        })
        .sort({ createdAt: -1 });

    let nextNumber = 1;

    if (lastDocument?.entityId) {
        const lastNumber = parseInt(
            lastDocument.entityId.split("-")[1],
            10
        );

        nextNumber = lastNumber + 1;
    }

    return `${prefix}-${String(nextNumber).padStart(6, "0")}`;
};