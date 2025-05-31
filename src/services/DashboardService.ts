import pool from '../db';

class DashboardService {
  public static async getCustomerOverview(customerId: number) {
    const [reqRows] = await pool.query(
      'SELECT COUNT(*) as requestCount FROM production_requests WHERE customer_id = ?',
      [customerId]
    );
    const requestCount = (reqRows as any[])[0].requestCount;

    const [appRows] = await pool.query(
      "SELECT COUNT(*) as approvedCount FROM production_requests WHERE customer_id = ? AND status = 'approved'",
      [customerId]
    );
    const approvedCount = (appRows as any[])[0].approvedCount;

    const [aucRows] = await pool.query(
      `SELECT COUNT(*) as auctionCount
         FROM auctions a
         JOIN production_requests pr ON a.productionId = pr.id
         WHERE pr.customer_id = ?`,
      [customerId]
    );
    const auctionCount = (aucRows as any[])[0].auctionCount;
    const [openRows] = await pool.query(
      `SELECT a.id, TIMESTAMPDIFF(SECOND, NOW(), a.endTime) as secondsLeft
       FROM auctions a
       JOIN production_requests pr ON a.productionId = pr.id
       WHERE pr.customer_id = ? AND a.status IN ('planned','active')`,
      [customerId]
    );
    const openAuctions = openRows as any[];

    return {
      requestCount,
      approvedCount,
      auctionCount,
      openAuctions
    };
  }

  public static async getManufacturerOverview(manufacturerId: number) {
    const [invRows] = await pool.query(
      `SELECT COUNT(*) as inviteCount FROM auction_invites WHERE manufacturerId = ?`,
      [manufacturerId]
    );
    const inviteCount = (invRows as any[])[0].inviteCount;

    const [activeRows] = await pool.query(
      `SELECT COUNT(*) as activeInvites
         FROM auction_invites ai
         JOIN auctions a ON ai.auctionId = a.id
         WHERE ai.manufacturerId = ? AND a.status IN ('planned','active')`,
      [manufacturerId]
    );
    const activeInvites = (activeRows as any[])[0].activeInvites;

    return {
      inviteCount,
      activeInvites
    };
  }

  public static async getAdminOverview() {
    const [uRows] = await pool.query('SELECT COUNT(*) as totalUsers FROM users');
    const totalUsers = (uRows as any[])[0].totalUsers;

    const [aRows] = await pool.query('SELECT COUNT(*) as totalAuctions FROM auctions');
    const totalAuctions = (aRows as any[])[0].totalAuctions;

    const [rRows] = await pool.query('SELECT COUNT(*) as totalRequests FROM production_requests');
    const totalRequests = (rRows as any[])[0].totalRequests;

    return { totalUsers, totalAuctions, totalRequests };
  }
}

export default DashboardService;