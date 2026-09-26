import type { AudioShowCrate } from "./audioshow-crates/types";
import { theFirstRuleCrate } from "./audioshow-crates/the-first-rule";
import { pinkFloydExperienceCrate } from "./audioshow-crates/a-pink-floyd-experience";
import { qingXiangWoKaiPaoCrate } from "./audioshow-crates/qing-xiang-wo-kai-pao";
import { posthumanWarCrate } from "./audioshow-crates/posthuman-war";
import { doctorDoctorCrate } from "./audioshow-crates/doctor-doctor";
import { longLiveRockCrate } from "./audioshow-crates/long-live-rock";
import { route88Crate } from "./audioshow-crates/route-88";
import { fiftyYearsInAHeartbeatCrate } from "./audioshow-crates/fifty-years-in-a-heartbeat";

export type { AudioShowCrate, AudioShowCrateTrack } from "./audioshow-crates/types";

export const audioshowCrates: AudioShowCrate[] = [
    theFirstRuleCrate,
    pinkFloydExperienceCrate,
    qingXiangWoKaiPaoCrate,
    posthumanWarCrate,
    doctorDoctorCrate,
    longLiveRockCrate,
    route88Crate,
    fiftyYearsInAHeartbeatCrate,
];

export function getAudioShowCrate(slug: string) {
    return audioshowCrates.find((crate) => crate.slug === slug);
}
