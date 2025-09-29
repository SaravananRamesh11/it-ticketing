
const { calculateTicketStats, mapOutOfTimeStats, buildFinalStats } = require('../function/admin');
const User = require('../../models/User');

jest.mock('../../models/User');

function mockUser(id, employeeId) {
  return { _id: id, employeeId };
}

describe('getTicketStats helpers', () => {

  test('calculateTicketStats groups tickets correctly', async () => {
    const tickets = [
      { itSupport: 'VISTA1', status: 'Open', createdAt: '2025-09-29', updatedAt: '2025-09-30' },
      { itSupport: 'VISTA1', status: 'Closed', createdAt: '2025-09-29', updatedAt: '2025-09-30' },
      { itSupport: null, status: 'InProgress', createdAt: '2025-09-29', updatedAt: '2025-09-30' }
    ];

    const statsMap = await calculateTicketStats(tickets);

    expect(statsMap['VISTA1'].Open).toBe(1);
    expect(statsMap['VISTA1'].Closed).toBe(1);
    expect(statsMap['Unassigned'].InProgress).toBe(1);
    expect(statsMap['VISTA1'].turnAroundTimes.length).toBe(1);
  });



  test('mapOutOfTimeStats maps correctly', async () => {
  const outOfTimeStats = [
    { user: 'user1', outOfTimeCount: 3 },
    { user: 'user2', outOfTimeCount: 5 }
  ];

  User.findById.mockImplementation(id => ({
    lean: () => {
      if (id === 'user1') return Promise.resolve({ _id: 'user1', employeeId: 'VISTA1' });
      if (id === 'user2') return Promise.resolve({ _id: 'user2', employeeId: 'VISTA2' });
      return Promise.resolve(null);
    }
  }));

  const outOfTimeMap = await mapOutOfTimeStats(outOfTimeStats);

  expect(outOfTimeMap['VISTA1']).toBe(3);
  expect(outOfTimeMap['VISTA2']).toBe(5);
});


  test('buildFinalStats calculates avgTurnAroundTime and outOfTimeCount', () => {
    const statsMap = {
      'VISTA1': {
        name: 'VISTA1',
        Open: 2,
        Closed: 2,
        InProgress: 1,
        turnAroundTimes: [3600000, 7200000] // 1h and 2h in ms
      }
    };

    const outOfTimeMap = { 'VISTA1': 5 };
    const stats = buildFinalStats(statsMap, outOfTimeMap);

    expect(stats.length).toBe(1);
    expect(stats[0].avgTurnAroundTime).toBe('1.50'); // avg of 1h and 2h
    expect(stats[0].outOfTimeCount).toBe(5);
  });

});
