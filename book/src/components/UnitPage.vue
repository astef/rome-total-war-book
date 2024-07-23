<script setup lang="ts">
import { defineProps } from "vue";
import { Unit } from "../types";

type Props = { unit: Unit; page: number };

const props = defineProps<Props>();

function hasSecondaryArmor() {
    return (
        Number(props.unit.stat_sec_armour[0]) +
            Number(props.unit.stat_sec_armour[1]) >
        1
    );
}

function hasMissile() {
    return props.unit.stat_pri[2] !== "no";
}
function isSiegeMissile() {
    return props.unit.stat_sec[5] === "siege_missile";
    // TODO
    // return props.unit.stat_sec[5] === "осадное орудие";
}

function translateStat(term: string): string {
    const statPriTranslation: Record<string, string | undefined> = {
        none: "-",
        no: "-",

        missile: "стрелковое",
        bullet: "ядра",
        stone: "камни",
        arrow: "стрелы",
        //
        thrown: "метательное",
        javelin: "дротик",
        pilum: "пилум",
        head: "головы",

        //
        melee: "ближний бой",
        sword: "меч",
        knife: "нож",
        spear: "копье",
        mace: "палка",
        axe: "топор",

        siege_missile: "осадное",
        boulder: "валун",
        big_boulder: "большой валун",
        repeating_ballista: "баллиста",
        scorpion: "скорпион",
        ballista: "баллиста",
    };
    const result = statPriTranslation[term];

    if (!result) {
        return `TODO: ${term}`;
    }
    return result;
}

function description() {
    return [...props.unit.attributes, ...props.unit.text_descr];
}

function getDescrClass(): string {
    let dlen = 0;

    for (const line of props.unit.attributes) {
        dlen += line.length;
        dlen += 40;
    }

    for (const line of props.unit.text_descr) {
        dlen += line.length;
        dlen += 40;
    }

    if (dlen < 900) {
        return "descr1";
    }
    if (dlen < 1700) {
        return "descr2";
    }
    return "descr3";
}
</script>

<template>
    <p class="pagenum">- {{ props.page }} -</p>
    <h2>{{ props.unit.text }}</h2>
    <div class="center">
        <div v-for="f in props.unit.ownership">
            <img
                width="32"
                height="32"
                class="fimg"
                :src="'factions/symbol128_' + f + '.png'"
            />
        </div>
    </div>
    <div class="container">
        <div class="left-panel-container">
            <div class="left-panel">
                <template v-for="img in props.unit.img.slice(0, 4)">
                    <img :src="img" />
                </template>
            </div>
        </div>
        <div class="right-panel">
            <div class="content">
                <div class="property">
                    Основная атака ({{ translateStat(props.unit.stat_pri[5]) }},
                    {{
                        hasMissile()
                            ? translateStat(props.unit.stat_pri[2])
                            : translateStat(props.unit.stat_pri[8])
                    }})
                </div>
                <div class="value">
                    {{ Number(props.unit.stat_pri[0]) }}
                </div>
            </div>
            <div v-if="Number(props.unit.stat_sec[0]) > 0" class="content">
                <div class="property">
                    Доп. атака ({{ translateStat(props.unit.stat_sec[5]) }},
                    {{
                        isSiegeMissile()
                            ? translateStat(props.unit.stat_sec[2])
                            : translateStat(props.unit.stat_sec[8])
                    }})
                </div>
                <div class="value">
                    {{ Number(props.unit.stat_sec[0]) }}
                </div>
            </div>
            <div v-if="hasMissile()" class="content">
                <div class="property">Дальность стрельбы</div>
                <div class="value">
                    {{ Number(props.unit.stat_pri[3]) }}
                </div>
            </div>
            <div v-if="hasMissile()" class="content">
                <div class="property">Количество боеприпасов на человека</div>
                <div class="value">
                    {{ Number(props.unit.stat_pri[4]) }}
                </div>
            </div>
            <div class="content">
                <div class="property">Улучшение при штурме</div>
                <div class="value">
                    {{ Number(props.unit.stat_pri[1]) }}
                </div>
            </div>

            <div class="content">
                <div class="property">Общая защита</div>
                <div class="value">
                    {{
                        Number(props.unit.stat_pri_armour[0]) +
                        Number(props.unit.stat_pri_armour[1]) +
                        Number(props.unit.stat_pri_armour[2])
                    }}
                </div>
            </div>

            <div class="content">
                <div class="minor-property">Доспехи</div>
                <div class="value">{{ props.unit.stat_pri_armour[0] }}</div>
            </div>
            <div class="content">
                <div class="minor-property">Навык защиты</div>
                <div class="value">{{ props.unit.stat_pri_armour[1] }}</div>
            </div>
            <div class="content">
                <div class="minor-property">Щит</div>
                <div class="value">{{ props.unit.stat_pri_armour[2] }}</div>
            </div>

            <template v-if="hasSecondaryArmor()">
                <div class="content">
                    <div class="property">Защита животного</div>
                    <div class="value">
                        {{
                            Number(props.unit.stat_sec_armour[0]) +
                            Number(props.unit.stat_sec_armour[1])
                        }}
                    </div>
                </div>

                <div class="content">
                    <div class="minor-property">Доспехи</div>
                    <div class="value">{{ props.unit.stat_sec_armour[0] }}</div>
                </div>
                <div class="content">
                    <div class="minor-property">Навык защиты</div>
                    <div class="value">{{ props.unit.stat_sec_armour[1] }}</div>
                </div>
            </template>

            <div class="content">
                <div class="property">Бонусы местности</div>
            </div>

            <div class="content">
                <div class="minor-property">Кустарники</div>
                <div class="value">{{ props.unit.stat_ground[0] }}</div>
            </div>
            <div class="content">
                <div class="minor-property">Пустыня</div>
                <div class="value">{{ props.unit.stat_ground[1] }}</div>
            </div>
            <div class="content">
                <div class="minor-property">Лес</div>
                <div class="value">{{ props.unit.stat_ground[2] }}</div>
            </div>
            <div class="content">
                <div class="minor-property">Снег</div>
                <div class="value">{{ props.unit.stat_ground[3] }}</div>
            </div>
        </div>
    </div>
    <!-- <h3>Краткое описание</h3>
    <p>{{ props.unit.text_descr_short }}</p> -->
    <h3>Описание</h3>
    <p v-for="line in description()" :class="getDescrClass()">{{ line }}</p>
    <div class="page-break"></div>
</template>

<style scoped>
h2 {
    text-align: center;
    line-height: 2;
    margin: 0;
}
p {
    margin: 0;
    padding: 0;
}
.descr1 {
    font-size: larger;
    line-height: 1.5;
}
.descr2 {
    font-size: medium;
    line-height: 1.3;
}
.descr3 {
    font-size: medium;
    line-height: 1;
}
.container {
    display: flex;
}
.left-panel-container {
    padding: 20px;
}
.left-panel {
    max-width: 320px;
}
.right-panel {
    flex-grow: 1;
    flex-direction: column;
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    padding: 20px;
    padding-bottom: 0px;
}
.content {
    display: flex;
    width: 100%;
    border: 1px solid black;
}
.property {
    padding: 4px;
    align-content: center;
}
.minor-property {
    padding: 0px;
    padding-left: 40px;
    align-content: center;
}
.value {
    flex-grow: 1;
    text-align: right;
    padding: 4px;
}
.center {
    display: flex;
    justify-content: center;
}
.fimg {
    margin: 4px;
}
.pagenum {
    font-size: large;
    text-align: center;
    font-weight: 800;
    line-height: 1;
    margin: 0;
}
.page-break {
    page-break-after: always;
}
</style>
