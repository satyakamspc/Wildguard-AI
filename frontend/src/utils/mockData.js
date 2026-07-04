export const mockScenarios = {
  cobra: {
    id: "cobra",
    name: "King Cobra (Critical Hazard)",
    imageUrl: "https://images.unsplash.com/photo-1531386151447-fd76ad50012f?auto=format&fit=crop&q=80&w=600",
    payload: {
      card_species: {
        common_name: "King Cobra",
        scientific_name: "Ophiophagus hannah",
        confidence: 0.94,
        image_quality_check: {
          passes: true,
          issue: null
        }
      },
      card_risk: {
        risk_rating: "Critical",
        primary_hazard: "Neurotoxic venomous bite; highly lethal without treatment.",
        proactive_precautions: [
          "Do not approach or try to capture the snake.",
          "Keep a minimum distance of 15 feet (5 meters).",
          "Avoid sudden movements; back away slowly in a straight line.",
          "If the cobra stands up and flares its hood, it is in a defensive posture—freeze and stay completely still."
        ],
        color_code: "danger"
      },
      card_first_aid: {
        disclaimer: "Disclaimer: This is emergency guidance only and not a substitute for professional medical care.",
        immediate_steps: [
          "CALL EMERGENCY SERVICES (911/112) IMMEDIATELY.",
          "Keep the victim calm and restrict movement. Elevate the bite area ONLY if it remains below heart level.",
          "Remove any rings, watches, or tight clothing near the bite site before swelling starts.",
          "Apply a broad pressure immobilization bandage (like an elastic crepe bandage) active over the entire limb, starting from the fingers/toes and binding upwards."
        ],
        critical_warnings: [
          "DO NOT cut the wound or try to suck out the venom.",
          "DO NOT apply ice or a tight arterial tourniquet.",
          "DO NOT give the victim alcohol, caffeine, or pain medications (like aspirin)."
        ],
        paramedic_checklist: [
          "Note the exact time of the bite.",
          "Document symptoms as they develop (e.g., droopy eyelids, difficulty breathing).",
          "Ensure the snake is NOT caught or brought to the hospital—take a photo instead if safe."
        ]
      },
      card_knowledge: {
        habitat: "Dense highland forests, bamboo thickets, and agricultural areas near water.",
        activity_pattern: "Diurnal",
        general_behavior: "Generally shy and avoids humans, but will defend itself aggressively when cornered or protecting eggs.",
        fun_fact: "The King Cobra is the only snake in the world that builds nests for its eggs, defending them fiercely until they hatch."
      }
    }
  },
  raccoon: {
    id: "raccoon",
    name: "North American Raccoon (Medium Hazard)",
    imageUrl: "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&q=80&w=600",
    payload: {
      card_species: {
        common_name: "North American Raccoon",
        scientific_name: "Procyon lotor",
        confidence: 0.88,
        image_quality_check: {
          passes: true,
          issue: null
        }
      },
      card_risk: {
        risk_rating: "Medium",
        primary_hazard: "Bite/scratch hazard; high-risk vector for Rabies transmission.",
        proactive_precautions: [
          "Do not try to feed or pet the raccoon.",
          "Make noise or clap hands to scare it away if it approaches.",
          "Secure all garbage cans and food sources to avoid attracting them.",
          "Keep domestic pets away; raccoons can be highly protective of offspring."
        ],
        color_code: "warning"
      },
      card_first_aid: {
        disclaimer: "Disclaimer: Animal bites and scratches can transmit rabies and bacterial infections.",
        immediate_steps: [
          "Wash the wound immediately and thoroughly with warm water and soap for at least 15 minutes.",
          "Apply an antiseptic cream or ointment and cover with a sterile bandage.",
          "Seek professional medical evaluation within 24 hours to assess the need for Rabies Post-Exposure Prophylaxis (PEP) and Tetanus booster."
        ],
        critical_warnings: [
          "DO NOT ignore minor scratches or lick marks from wild raccoons.",
          "DO NOT try to capture or corner the animal yourself."
        ],
        paramedic_checklist: [
          "Note if the raccoon appeared unusually aggressive, disoriented, or active during midday.",
          "Record the approximate time of the encounter.",
          "Report the animal spotting to local animal control services."
        ]
      },
      card_knowledge: {
        habitat: "Deciduous forests, wetlands, urban areas, and suburbs.",
        activity_pattern: "Nocturnal",
        general_behavior: "Highly intelligent and adaptable. Curious foragers who use their dexterous front paws to open containers.",
        fun_fact: "Raccoons have a habit of 'washing' their food in water. This is not for cleanliness, but to wet their paws, which increases the tactile sensitivity of their nerve endings."
      }
    }
  },
  turtle: {
    id: "turtle",
    name: "Eastern Box Turtle (Low Hazard)",
    imageUrl: "https://images.unsplash.com/photo-1518467166-367ae630dd37?auto=format&fit=crop&q=80&w=600",
    payload: {
      card_species: {
        common_name: "Eastern Box Turtle",
        scientific_name: "Terrapene carolina carolina",
        confidence: 0.97,
        image_quality_check: {
          passes: true,
          issue: null
        }
      },
      card_risk: {
        risk_rating: "Low",
        primary_hazard: "Generally harmless; minor risk of Salmonella if handled.",
        proactive_precautions: [
          "Observe from a comfortable distance.",
          "If helping it cross a road, move it in the direction it was already traveling.",
          "If handled, wash hands immediately with soap and water."
        ],
        color_code: "success"
      },
      card_first_aid: {
        disclaimer: "Disclaimer: Healthy turtles rarely pose immediate safety threats.",
        immediate_steps: [
          "Wash hands thoroughly after any physical contact.",
          "If nipped (rare), clean the minor pinch wound with soap and water."
        ],
        critical_warnings: [
          "DO NOT take wild turtles home as pets—they are critical to their native ecosystem."
        ],
        paramedic_checklist: [
          "No emergency medical response is usually required unless an infection develops."
        ]
      },
      card_knowledge: {
        habitat: "Grasslands, moist forests, woodlands, and marshy pastures.",
        activity_pattern: "Diurnal",
        general_behavior: "Shy, slow-moving terrestrial turtles. They withdraw completely into their hinged shells when threatened.",
        fun_fact: "Eastern Box Turtles are incredibly long-lived; they can survive for over 100 years in the wild under optimal conditions."
      }
    }
  },
  blurry: {
    id: "blurry",
    name: "Low Quality Image (Failed Check)",
    imageUrl: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&q=80&w=600",
    payload: {
      card_species: {
        common_name: "Unidentified Creature",
        scientific_name: "Unknown",
        confidence: 0.0,
        image_quality_check: {
          passes: false,
          issue: "Image is too dark or blurry to provide a reliable classification."
        }
      },
      card_risk: {
        risk_rating: "High",
        primary_hazard: "High Uncertainty - Threat level assumed high out of caution.",
        proactive_precautions: [
          "Back away from the creature immediately.",
          "Do not try to get closer to take a better photo.",
          "Assume the creature is dangerous until proven otherwise."
        ],
        color_code: "danger"
      },
      card_first_aid: {
        disclaimer: "Disclaimer: General safety advice only.",
        immediate_steps: [
          "If bitten or stung, call emergency services immediately.",
          "Wash any wounds with soap and running water."
        ],
        critical_warnings: [
          "DO NOT approach unidentified animals."
        ],
        paramedic_checklist: [
          "Be prepared to describe the size, color, and behavior of the creature to medical responders."
        ]
      },
      card_knowledge: {
        habitat: "Unknown",
        activity_pattern: "Diurnal",
        general_behavior: "N/A",
        fun_fact: "Taking a photo with the light source behind you can help the species identification system verify the colors and features of the animal."
      }
    }
  }
};
