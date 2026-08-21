"use client";

import Image from "next/image";
import type { PointerEvent } from "react";
import { useRef } from "react";
import styles from "@/styles/landing.module.css";

export function AnimatedStarHero() {
  const stageRef = useRef<HTMLDivElement | null>(null);

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const stage = stageRef.current;
    if (!stage) return;
    const bounds = stage.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    stage.style.setProperty("--motion-x", `${x * -12}px`);
    stage.style.setProperty("--motion-y", `${y * -10}px`);
    stage.style.setProperty("--tilt-x", `${y * -1.2}deg`);
    stage.style.setProperty("--tilt-y", `${x * 1.2}deg`);
  }

  function resetMotion() {
    const stage = stageRef.current;
    if (!stage) return;
    stage.style.setProperty("--motion-x", "0px");
    stage.style.setProperty("--motion-y", "0px");
    stage.style.setProperty("--tilt-x", "0deg");
    stage.style.setProperty("--tilt-y", "0deg");
  }

  return (
    <div
      className={styles.heroVisual}
      aria-label="Mẫu Liễu Hạnh trong lá XVII — The Star"
      onPointerMove={handlePointerMove}
      onPointerLeave={resetMotion}
    >
      <div className={styles.heroDrum} aria-hidden="true">
        <Image
          src="/images/huong-dong-trong-dong.png"
          fill
          priority
          unoptimized
          sizes="(max-width: 900px) 92vw, 43vw"
          alt=""
        />
      </div>
      <div className={styles.ritualHalo} aria-hidden="true">
        <i /><i /><i />
      </div>
      <div className={styles.starStage} ref={stageRef}>
        <div className={styles.starArtwork}>
          <Image
            className={styles.starImage}
            src="/images/hero-mau-lieu-hanh.png"
            width={1024}
            height={1536}
            priority
            unoptimized
            sizes="(max-width: 900px) 84vw, 36vw"
            alt="Mẫu Liễu Hạnh trong áo xanh ngọc đứng trước phủ thờ Bắc Bộ, dưới ngôi sao dẫn đường và bên hồ sen"
          />
        </div>
        <div className={styles.starIndex} aria-hidden="true">
          <span>XVII</span>
          <small>The Star</small>
        </div>
        <div className={styles.starName}>
          <small>Tứ Bất Tử · Ánh sao dẫn lối</small>
          <strong>Mẫu Liễu Hạnh</strong>
          <span>Hy vọng · chữa lành · bảo hộ</span>
        </div>
      </div>
      <p className={styles.visualCaption}><span>XVII</span> / Bình minh sau giông bão</p>
    </div>
  );
}
