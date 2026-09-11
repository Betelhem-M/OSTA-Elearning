const Researcher = require("../models/Researcher");
const Publication = require("../models/Publication");
const User = require("../models/User");

function researcherStatus(req) {
  return String(req.user?.account_type || "").toLowerCase() === "researcher";
}

async function getOwnResearcher(userId) {
  return Researcher.findByUserId(userId);
}

const researchController = {
  async getResearchers(req, res) {
    try {
      return res.json(await Researcher.findAll());
    } catch (error) {
      console.error("Get researchers error:", error);
      return res.status(500).json({ message: "Failed to fetch researchers" });
    }
  },

  async getResearcher(req, res) {
    try {
      const researcher = await Researcher.findById(req.params.id);
      if (!researcher) return res.status(404).json({ message: "Researcher not found" });
      const publications = await Publication.findPublished();
      return res.json({
        ...researcher,
        publications: publications.filter((p) => Number(p.researcher_id) === Number(researcher.id)),
      });
    } catch (error) {
      console.error("Get researcher error:", error);
      return res.status(500).json({ message: "Failed to fetch researcher" });
    }
  },

  async getPublications(req, res) {
    try {
      const publications = await Publication.findPublished();
      return res.json(publications.map((p) => ({
        ...p,
        content: undefined,
        file_data: undefined,
        abstract: p.abstract ? `${p.abstract.slice(0, 220)}${p.abstract.length > 220 ? "..." : ""}` : null,
      })));
    } catch (error) {
      console.error("Get public publications error:", error);
      return res.status(500).json({ message: "Failed to fetch publications" });
    }
  },

  async getPublication(req, res) {
    try {
      const publication = await Publication.findById(req.params.id);
      if (!publication) return res.status(404).json({ message: "Publication not found" });

      if (!req.user) {
        if (publication.status !== "published") return res.status(403).json({ message: "You do not have access to this publication" });
        return res.json(publication);
      }

      const user = await User.findById(req.user.id);
      if (user?.role === "admin") return res.json(publication);

      const researcher = await getOwnResearcher(req.user.id);
      if (researcher && Number(publication.researcher_id) === Number(researcher.id)) return res.json(publication);
      if (publication.status === "published") return res.json(publication);

      return res.status(403).json({ message: "You do not have access to this publication" });
    } catch (error) {
      console.error("Get publication error:", error);
      return res.status(500).json({ message: "Failed to fetch publication" });
    }
  },

  async createResearcher(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: "User not found" });
      if (user.account_type !== "researcher") return res.status(403).json({ message: "Only researcher accounts can create a researcher profile" });
      if (await Researcher.findByUserId(req.user.id)) return res.status(409).json({ message: "Researcher profile already exists" });

      const researcherId = await Researcher.create({ userId: req.user.id, ...req.body });
      return res.status(201).json({ message: "Researcher profile created successfully", researcher: await Researcher.findById(researcherId) });
    } catch (error) {
      console.error("Create researcher error:", error);
      return res.status(500).json({ message: "Failed to create researcher profile" });
    }
  },

  async myPublications(req, res) {
    try {
      if (!researcherStatus(req)) return res.status(403).json({ message: "Researcher access required" });
      const researcher = await getOwnResearcher(req.user.id);
      if (!researcher) return res.json([]);
      return res.json(await Publication.findByResearcher(researcher.id));
    } catch (error) {
      console.error("Get researcher publications error:", error);
      return res.status(500).json({ message: "Failed to fetch your research" });
    }
  },

  async createPublication(req, res) {
    try {
      if (!researcherStatus(req)) return res.status(403).json({ message: "Only researcher accounts can create publications" });
      const researcher = await getOwnResearcher(req.user.id);
      if (!researcher) return res.status(400).json({ message: "Create a researcher profile first" });

      const { title, abstract, content, field, publicationYear, publicationUrl, action } = req.body;
      const cleanTitle = String(title || "").trim();
      const cleanContent = String(content || "").trim();
      const hasFile = Boolean(req.file);
      if (!cleanTitle) return res.status(400).json({ message: "Research title is required" });
      if (!cleanContent && !hasFile) return res.status(400).json({ message: "Write your research or upload a research document" });

      const status = action === "publish" ? "pending" : "draft";
      const publicationId = await Publication.create({
        researcherId: researcher.id,
        title: cleanTitle,
        abstract,
        content: cleanContent || null,
        field,
        publicationYear,
        publicationUrl,
        fileName: req.file?.originalname,
        fileMimeType: req.file?.mimetype,
        fileSize: req.file?.size,
        fileData: req.file?.buffer,
        status,
      });

      return res.status(201).json({
        message: status === "pending" ? "Research submitted for review" : "Research saved as draft",
        publication: await Publication.findById(publicationId),
      });
    } catch (error) {
      console.error("Create publication error:", error);
      return res.status(500).json({ message: "Failed to save research" });
    }
  },

  async updatePublication(req, res) {
    try {
      const researcher = await getOwnResearcher(req.user.id);
      if (!researcher) return res.status(403).json({ message: "Researcher profile not found" });
      const publication = await Publication.findById(req.params.id);
      if (!publication) return res.status(404).json({ message: "Publication not found" });
      if (Number(publication.researcher_id) !== Number(researcher.id)) return res.status(403).json({ message: "You are not allowed to update this publication" });

      const { title, abstract, content, field, publicationYear, publicationUrl, action } = req.body;
      if (!String(title || "").trim()) return res.status(400).json({ message: "Research title is required" });
      if (!String(content || "").trim() && !publication.file_name && !req.file) return res.status(400).json({ message: "Write your research or upload a research document" });

      await Publication.update(req.params.id, {
        title: String(title).trim(),
        abstract,
        content,
        field,
        publicationYear,
        publicationUrl,
        fileName: req.file?.originalname,
        fileMimeType: req.file?.mimetype,
        fileSize: req.file?.size,
        fileData: req.file?.buffer,
      });
      await Publication.updateStatus(req.params.id, action === "publish" ? "pending" : "draft");

      return res.json({
        message: action === "publish" ? "Research submitted for review" : "Research draft saved",
        publication: await Publication.findById(req.params.id),
      });
    } catch (error) {
      console.error("Update publication error:", error);
      return res.status(500).json({ message: "Failed to save research" });
    }
  },

  async downloadFile(req, res) {
    try {
      const publication = await Publication.findById(req.params.id);
      if (!publication || !publication.file_name) return res.status(404).json({ message: "Research file not found" });
      const file = await Publication.getFile(req.params.id);
      if (!file?.file_data) return res.status(404).json({ message: "Research file not found" });
      if (file.status !== "published" && (!req.user || Number(publication.researcher_id) !== Number((await getOwnResearcher(req.user.id))?.id) && req.user.role !== "admin")) {
        return res.status(403).json({ message: "You do not have access to this research file" });
      }
      res.setHeader("Content-Type", file.file_mime_type || "application/octet-stream");
      res.setHeader("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(file.file_name)}`);
      return res.send(file.file_data);
    } catch (error) {
      console.error("Download research file error:", error);
      return res.status(500).json({ message: "Failed to download research file" });
    }
  },

  async deletePublication(req, res) {
    try {
      const publication = await Publication.findById(req.params.id);
      if (!publication) return res.status(404).json({ message: "Publication not found" });
      const user = await User.findById(req.user.id);
      const researcher = await getOwnResearcher(req.user.id);
      if (user?.role !== "admin" && (!researcher || Number(publication.researcher_id) !== Number(researcher.id))) return res.status(403).json({ message: "You are not allowed to delete this publication" });
      await Publication.delete(req.params.id);
      return res.json({ message: "Publication deleted successfully" });
    } catch (error) {
      console.error("Delete publication error:", error);
      return res.status(500).json({ message: "Failed to delete publication" });
    }
  },

  async getAllForAdmin(req, res) {
    try {
      if (req.user.role !== "admin") return res.status(403).json({ message: "Admin access required" });
      return res.json(await Publication.findAll());
    } catch (error) {
      console.error("Get admin publications error:", error);
      return res.status(500).json({ message: "Failed to fetch publications" });
    }
  },

  async updatePublicationStatus(req, res) {
    try {
      if (req.user.role !== "admin") return res.status(403).json({ message: "Admin access required" });
      const allowed = ["draft", "pending", "published", "rejected"];
      if (!allowed.includes(req.body.status)) return res.status(400).json({ message: "Invalid publication status" });
      await Publication.updateStatus(req.params.id, req.body.status);
      return res.json({ message: `Publication ${req.body.status}` });
    } catch (error) {
      console.error("Update publication status error:", error);
      return res.status(500).json({ message: "Failed to update publication status" });
    }
  },
};

module.exports = researchController;
