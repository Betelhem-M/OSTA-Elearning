const pool = require("../config/database");

const portalController = {
  async researcher(req, res) {
    try {
      const accountType = String(req.user?.account_type || "").toLowerCase();
      const role = String(req.user?.role || "").toLowerCase();

      if (accountType !== "researcher" && role !== "researcher") {
        return res.status(403).json({
          success: false,
          message: "Researcher access required",
        });
      }

      const uid = req.user.id;
      const [[researcher]] = await pool.execute(
        "SELECT id FROM researchers WHERE user_id = ? LIMIT 1",
        [uid]
      );

      // A researcher account may exist before its researcher profile is created.
      // The dashboard should still load instead of returning a server error.
      if (!researcher) {
        return res.json({
          success: true,
          data: {
            stats: { submissions: 0, pending: 0, approved: 0 },
            recent: [],
          },
        });
      }

      const researcherId = researcher.id;

      const [[s]] = await pool.execute(
        "SELECT COUNT(*) AS total FROM publications WHERE researcher_id = ?",
        [researcherId]
      );

      const [[p]] = await pool.execute(
        "SELECT COUNT(*) AS pending FROM publications WHERE researcher_id = ? AND status = 'pending'",
        [researcherId]
      );

      const [[a]] = await pool.execute(
        "SELECT COUNT(*) AS approved FROM publications WHERE researcher_id = ? AND status IN ('approved', 'published')",
        [researcherId]
      );

      const [recent] = await pool.execute(
        `SELECT id, title, status, created_at
         FROM publications
         WHERE researcher_id = ?
         ORDER BY created_at DESC
         LIMIT 6`,
        [researcherId]
      );

      return res.json({
        success: true,
        data: {
          stats: {
            submissions: Number(s.total) || 0,
            pending: Number(p.pending) || 0,
            approved: Number(a.approved) || 0,
          },
          recent,
        },
      });
    } catch (error) {
      console.error("Failed to load researcher dashboard:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to load researcher dashboard",
      });
    }
  },

  async entrepreneur(req, res) {
    try {
      if (!["entrepreneur", "innovator"].includes(req.user.account_type)) {
        return res.status(403).json({
          success: false,
          message: "Entrepreneur access required",
        });
      }

      const uid = req.user.id;
      const [[ideas]] = await pool.execute(
        "SELECT COUNT(*) total FROM innovation_ideas WHERE user_id=?",
        [uid]
      );
      const [[startups]] = await pool.execute(
        "SELECT COUNT(*) total FROM startups WHERE founder_id=?",
        [uid]
      );
      const [[published]] = await pool.execute(
        "SELECT COUNT(*) total FROM innovation_ideas WHERE user_id=? AND status='published'",
        [uid]
      );
      const [recent] = await pool.execute(
        `SELECT id,title,status,created_at,'idea' item_type FROM innovation_ideas WHERE user_id=?
         UNION ALL
         SELECT id,name title,stage status,created_at,'startup' item_type FROM startups WHERE founder_id=?
         ORDER BY created_at DESC LIMIT 8`,
        [uid, uid]
      );

      return res.json({
        success: true,
        data: {
          stats: {
            ideas: Number(ideas.total),
            startups: Number(startups.total),
            published: Number(published.total),
          },
          recent,
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Failed to load entrepreneur dashboard",
      });
    }
  },
};

module.exports = portalController;
