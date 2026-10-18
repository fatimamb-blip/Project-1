// DATA MODEL //

const VENUE = {
  name: 'Aurora Hall',
 
  event: {
    title: 'Winter Gala Concert',
    date: '2026-12-19T19:30'
  },
 
  currency: { code: 'AZN', symbol: '₼' },
 
  
  width: 1400,
  height: 1030,
  seatSize: 26,  
  seatStep: 32,   
  rowStep: 34,    
  aisleWidth: 26, 
 
  maxTicketsPerOrder: 10,
 
 
  unavailability: {
    seed: 'aurora-gala-2026',
    rate: 0.14,
    blocked: ['BAL-M-15', 'BAL-M-16', 'BAL-N-15', 'BAL-N-16', 'ORC-A-1', 'ORC-A-18']
  },
 

  categories: {
    box: {
      label: 'Royal Box',
      price: 120,
      color: '#ff7a59',
      description: 'Private side box close to the stage with extra legroom.'
    },
    vip: {
      label: 'VIP',
      price: 95,
      color: '#f5b942',
      description: 'Front orchestra rows — the closest view of the performers.'
    },
    premium: {
      label: 'Premium',
      price: 65,
      color: '#d36bff',
      description: 'Central stalls with the best balance of sound and view.'
    },
    standard: {
      label: 'Standard',
      price: 45,
      color: '#3fb6f5',
      description: 'Side stalls with an angled view of the stage.'
    },
    economy: {
      label: 'Economy',
      price: 25,
      color: '#9aa5ff',
      description: 'Upper balcony with a full overview of the hall.'
    }
  },
 

  sections: [
    {
      id: 'BXL', name: 'Box Left', category: 'box',
      rows: ['A', 'B', 'C'], seatsPerRow: 4, aisleAfter: [],
      cx: 190, y: 90, curve: 0
    },
    {
      id: 'BXR', name: 'Box Right', category: 'box',
      rows: ['A', 'B', 'C'], seatsPerRow: 4, aisleAfter: [],
      cx: 1210, y: 90, curve: 0
    },
    {
      id: 'ORC', name: 'Orchestra', category: 'vip',
      rows: ['A', 'B', 'C', 'D'], seatsPerRow: 18, aisleAfter: [9],
      cx: 700, y: 210, curve: 14
    },
    {
      id: 'STL', name: 'Stalls Left', category: 'standard',
      rows: ['E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'], seatsPerRow: 7, aisleAfter: [],
      cx: 190, y: 420, curve: 0
    },
    {
      id: 'STC', name: 'Stalls Centre', category: 'premium',
      rows: ['E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'], seatsPerRow: 20, aisleAfter: [10],
      cx: 700, y: 410, curve: 16
    },
    {
      id: 'STR', name: 'Stalls Right', category: 'standard',
      rows: ['E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'], seatsPerRow: 7, aisleAfter: [],
      cx: 1210, y: 420, curve: 0
    },
    {
      id: 'BAL', name: 'Balcony', category: 'economy',
      rows: ['M', 'N', 'O', 'P', 'Q'], seatsPerRow: 30, aisleAfter: [10, 20],
      cx: 700, y: 810, curve: 24
    }
  ],
 

  features: [
    { type: 'stage',    label: 'Stage',               x: 450,  y: 30,  w: 500, h: 100 },
    { type: 'entrance', label: 'Entrance A',          x: 12,   y: 700, w: 64,  h: 90 },
    { type: 'entrance', label: 'Entrance B',          x: 1324, y: 700, w: 64,  h: 90 },
    { type: 'booth',    label: 'Sound & light booth', x: 590,  y: 704, w: 220, h: 34 },
    { type: 'label',    label: 'Balcony level ↑',     x: 1240, y: 760, w: 150, h: 20 },
    { type: 'exit',     label: 'Exit',                x: 12,   y: 960, w: 64,  h: 40 },
    { type: 'exit',     label: 'Exit',                x: 1324, y: 960, w: 64,  h: 40 }
  ]
};


