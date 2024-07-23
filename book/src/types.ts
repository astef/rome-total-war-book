import z from "zod";

export const UnitType = z.object({
    text: z.string(),
    text_descr: z.array(z.string()),
    text_descr_short: z.string(),
    img: z.array(z.string()),
    attributes: z.array(z.string()),
    stat_pri_armour: z.array(z.string()),
    stat_sec_armour: z.array(z.string()),
    stat_pri: z.array(z.string()),
    stat_sec: z.array(z.string()),
    ownership: z.array(z.string()),
    stat_ground: z.array(z.string()),
});

export type Unit = z.infer<typeof UnitType>;

export const UnitsType = z.array(UnitType);

export type Units = z.infer<typeof UnitsType>;
