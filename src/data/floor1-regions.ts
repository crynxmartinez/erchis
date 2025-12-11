export interface MapRegion {
  id: string
  name: string
  type: 'town' | 'field' | 'dungeon' | 'boss'
  level: string
  polygon: string
  discovered: boolean
  href: string
}

export const FLOOR_1_REGIONS: MapRegion[] = [
  {
    id: 'town-of-beginnings',
    name: 'Town of Beginnings',
    type: 'town',
    level: 'Safe',
    polygon: '50,420 120,380 180,400 180,480 140,520 60,500',
    discovered: true,
    href: '/floor/1/town',
  },
  {
    id: 'verdant-plains',
    name: 'Verdant Plains',
    type: 'field',
    level: '1-5',
    polygon: '200,350 320,300 380,350 400,450 350,520 280,530 200,480',
    discovered: true,
    href: '/floor/1/area/verdant-plains',
  },
  {
    id: 'emerald-coast',
    name: 'Emerald Coast',
    type: 'field',
    level: '1-3',
    polygon: '30,520 140,530 200,580 220,650 180,700 80,700 20,620',
    discovered: true,
    href: '/floor/1/area/emerald-coast',
  },
  {
    id: 'sunlit-terraces',
    name: 'Sunlit Terraces',
    type: 'field',
    level: '5-10',
    polygon: '180,200 280,180 350,220 380,300 300,350 200,320 160,260',
    discovered: true,
    href: '/floor/1/area/sunlit-terraces',
  },
  {
    id: 'amber-woods',
    name: 'Amber Woods',
    type: 'field',
    level: '8-12',
    polygon: '550,300 650,280 700,350 680,450 600,480 520,420 530,350',
    discovered: true,
    href: '/floor/1/area/amber-woods',
  },
  {
    id: 'frostwind-peaks',
    name: 'Frostwind Peaks',
    type: 'field',
    level: '12-15',
    polygon: '280,50 400,30 500,60 520,140 450,200 350,180 280,120',
    discovered: true,
    href: '/floor/1/area/frostwind-peaks',
  },
  {
    id: 'withered-hollow',
    name: 'Withered Hollow',
    type: 'field',
    level: '10-14',
    polygon: '280,550 380,530 450,580 480,650 420,700 320,700 260,640',
    discovered: true,
    href: '/floor/1/area/withered-hollow',
  },
  {
    id: 'crimson-citadel',
    name: 'Crimson Citadel',
    type: 'town',
    level: 'Safe',
    polygon: '550,180 620,150 680,180 700,250 650,280 580,270 540,230',
    discovered: true,
    href: '/floor/1/area/crimson-citadel',
  },
  {
    id: 'ember-crater',
    name: 'Ember Crater',
    type: 'dungeon',
    level: '8-10',
    polygon: '20,300 80,260 130,300 130,380 80,420 20,380',
    discovered: true,
    href: '/floor/1/dungeon/ember-crater',
  },
  {
    id: 'crystal-sanctum',
    name: 'Crystal Sanctum',
    type: 'dungeon',
    level: '12-15',
    polygon: '620,30 700,20 730,80 710,150 650,140 600,90',
    discovered: true,
    href: '/floor/1/dungeon/crystal-sanctum',
  },
  {
    id: 'blackwater-keep',
    name: 'Blackwater Keep',
    type: 'dungeon',
    level: '14-18',
    polygon: '500,500 580,480 650,520 660,600 600,650 520,620 480,560',
    discovered: true,
    href: '/floor/1/dungeon/blackwater-keep',
  },
  {
    id: 'abyss-gate',
    name: 'The Abyss Gate',
    type: 'dungeon',
    level: '15-18',
    polygon: '680,380 720,350 736,400 736,500 700,520 660,480 660,420',
    discovered: true,
    href: '/floor/1/dungeon/abyss-gate',
  },
  {
    id: 'shadowpeak-fortress',
    name: 'Shadowpeak Fortress',
    type: 'boss',
    level: '20',
    polygon: '50,50 180,30 220,100 200,180 120,200 40,160 20,100',
    discovered: true,
    href: '/floor/1/boss',
  },
]
