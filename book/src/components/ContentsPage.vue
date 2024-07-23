<script setup lang="ts">
import { defineProps } from "vue";
import { Unit } from "../types";

type Props = { units: Unit[] };

const props = defineProps<Props>();

function translateOwnership(o: string): string {
    o = o.toUpperCase();

    if (o == "ROMANS_JULII") return "Дом Юлиев";
    if (o == "ROMANS_BRUTII") return "Дом Брутов";
    if (o == "ROMANS_SCIPII") return "Дом Сципионов";
    if (o == "ROMANS_SENATE") return "Сенат и граждане Рима";
    if (o == "MACEDON") return "Македония";
    if (o == "EGYPT") return "Египет";
    if (o == "SELEUCID") return "Империя Селевкидов";
    if (o == "CARTHAGE") return "Карфаген";
    if (o == "PARTHIA") return "Парфия";
    if (o == "PONTUS") return "Понт";
    if (o == "GAULS") return "Галлия";
    if (o == "GERMANS") return "Германия";
    if (o == "BRITONS") return "Британия";
    if (o == "ARMENIA") return "Армения";
    if (o == "DACIA") return "Дакия";
    if (o == "GREEK_CITIES") return "Греческие города";
    if (o == "NUMIDIA") return "Нумидия";
    if (o == "SCYTHIA") return "Скифия";
    if (o == "SPAIN") return "Испания";
    if (o == "THRACE") return "Фракия";
    if (o == "SLAVE") return "Повстанцы";
    if (o == "ALEMANNI") return "Алеманны";
    if (o == "EMPIRE_EAST") return "Римляне (Западная империя)";
    if (o == "EMPIRE_WEST") return "Римляне (Восточная империя)";
    if (o == "EMPIRE_EAST_REBELS")
        return "Римляне (мятежники Восточной империи)";
    if (o == "EMPIRE_WEST_REBELS")
        return "Римляне (мятежники Западной империи)";
    if (o == "FRANKS") return "Франки";
    if (o == "HUNS") return "Гунны";
    if (o == "SARMATIANS") return "Сарматы";
    if (o == "SASSANIDS") return "Сасаниды";
    if (o == "SAXONS") return "Саксы";
    if (o == "VANDALS") return "Вандалы";
    if (o == "GOTHS") return "Готы";
    if (o == "CELTS") return "Кельты";
    if (o == "WHITE_HUNS") return "Белые гунны";
    if (o == "OSTROGOTHS") return "Остготы";
    if (o == "ROMANO_BRITISH") return "Британские римляне";
    if (o == "SLAVS") return "Славяне";
    if (o == "MOORS") return "Мавры";
    if (o == "BERBERS") return "Берберы";

    return o;
}
</script>

<template>
    <h2>Содержание</h2>
    <div class="container">
        <div class="row" v-for="(u, i) of props.units">
            <div>
                <span class="unit"> {{ u.text }} </span>
                <span class="faction">
                    ({{ u.ownership.map(translateOwnership).join(", ") }})
                </span>
            </div>
            <div class="pagenum">
                <span>{{ i + 1 }}</span>
            </div>
        </div>
    </div>
    <div class="page-break"></div>
</template>

<style scoped>
h2 {
    text-align: center;
}
p {
    margin: 0;
    padding: 0;
}
.container {
    display: flex;
    flex-direction: column;
}
.unit {
    font-weight: 600;
}
.faction {
    font-size: small;
}
.row {
    display: flex;
    flex-direction: row;
    border-bottom: 1px dotted black;
}
.pagenum {
    flex: 1;
    font-weight: 600;
    text-align: right;
}
.page-break {
    page-break-after: always;
}
</style>
