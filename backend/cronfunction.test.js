// backend/controller/test/cronJob.test.js
const { isLastDayOfMonth, runMonthlyMaintenance,sendInProgressTicketReminder } = require('./cronfunction');
const Ticket = require('./models/Ticket');
const sendEmail = require('./services/mailservice');

const exportAndDeleteClosedTickets = require('./utils/exportTickets');
const ITSupportStats = require('./models/out_count.js');

jest.mock('./utils/exportTickets');
jest.mock('./models/out_count');
jest.mock('./models/Ticket');
jest.mock('./services/mailservice');

describe('isLastDayOfMonth', () => {
  test('returns true on last day of the month', () => {
    const date = new Date('2025-02-28'); // Feb 28, 2025
    expect(isLastDayOfMonth(date)).toBe(true);
  });

  test('returns false on a non-last day', () => {
    const date = new Date('2025-02-15');
    expect(isLastDayOfMonth(date)).toBe(false);
  });
});

describe('runMonthlyMaintenance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('calls exportAndDeleteClosedTickets and resets counts', async () => {
    exportAndDeleteClosedTickets.mockResolvedValue();
    ITSupportStats.resetAllCounts.mockResolvedValue();

    await runMonthlyMaintenance();

    expect(exportAndDeleteClosedTickets).toHaveBeenCalled();
    expect(ITSupportStats.resetAllCounts).toHaveBeenCalled();
  });

  test('throws error if export fails', async () => {
    exportAndDeleteClosedTickets.mockRejectedValue(new Error('Export failed'));

    await expect(runMonthlyMaintenance()).rejects.toThrow('Export failed');
  });

  test('throws error if resetAllCounts fails', async () => {
    exportAndDeleteClosedTickets.mockResolvedValue();
    ITSupportStats.resetAllCounts.mockRejectedValue(new Error('Reset failed'));

    await expect(runMonthlyMaintenance()).rejects.toThrow('Reset failed');
  });
});

// cronjob 2 tests




describe("sendInProgressTicketReminder", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should log and return 'No tickets' if no in-progress tickets are found", async () => {
    Ticket.getInProgressTickets.mockResolvedValue([]);

    const result = await sendInProgressTicketReminder();

    expect(result).toBe("No tickets");
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("should send an email if in-progress tickets exist", async () => {
    const mockTickets = [
      {
        _id: "123",
        issue: { main: "Network", sub: "Router", inner_sub: "Connection" },
        itSupport: "John Doe",
        createdAt: new Date("2025-09-01T10:00:00Z"),
        status: "In Progress"
      }
    ];

    Ticket.getInProgressTickets.mockResolvedValue(mockTickets);
    sendEmail.mockResolvedValue(true);

    const result = await sendInProgressTicketReminder();

    expect(result).toBe("Email sent");
    expect(sendEmail).toHaveBeenCalledWith(
      expect.any(String), // HR email
      expect.stringContaining("Reminder: In-Progress Tickets"),
      expect.stringContaining("Ticket ID: 123")
    );
  });

  it("should throw an error if fetching tickets fails", async () => {
    Ticket.getInProgressTickets.mockRejectedValue(new Error("DB error"));

    await expect(sendInProgressTicketReminder()).rejects.toThrow("DB error");
    expect(sendEmail).not.toHaveBeenCalled();
  });
});

