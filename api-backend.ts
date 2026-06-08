import express from "express";
import path from "path";
import fs from "fs";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, setDoc, doc, deleteDoc } from "firebase/firestore";
import { STATIC_LISTINGS } from "./data";
import { Listing } from "./types";

const api = express();

// Support JSON bodies
api.use(express.json({ limit: "50mb" }));

// Compatibility layer for Connect/Vite dev server where res.status, res.json, and res.send do not natively exist
api.use((req: any, res: any, next: any) => {
  if (res && !res.status) {
    res.status = function (code: number) {
      this.statusCode = code;
      return this;
    };
  }
  if (res && !res.json) {
    res.json = function (obj: any) {
      this.setHeader("Content-Type", "application/json; charset=utf-8");
      this.end(JSON.stringify(obj));
      return this;
    };
  }
  if (res && !res.send) {
    res.send = function (body: any) {
      if (typeof body === "object") {
         return this.json(body);
      }
      this.end(body);
      return this;
    };
  }
  next();
});

// Initialize Firebase SDK
let db: any = null;
try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    console.log("Firebase initialized successfully with project ID:", firebaseConfig.projectId);
  }
} catch (e) {
  console.error("Firebase initialization failed, falling back to local JSON files:", e);
}

// Local File Paths (for offline/fallback/cold-start caching)
const dbPath = path.join(process.cwd(), "listings.json");
const chatsPath = path.join(process.cwd(), "chats.json");
const announcementsPath = path.join(process.cwd(), "announcements.json");
const requestsPath = path.join(process.cwd(), "requests.json");
const usersPath = path.join(process.cwd(), "users.json");

// Helper database getters
const getListingsFromDb = async (): Promise<Listing[]> => {
  if (db) {
    try {
      const snapshot = await getDocs(collection(db, "listings"));
      if (!snapshot.empty) {
        const listings: Listing[] = snapshot.docs.map(doc => doc.data() as Listing);
        listings.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
        return listings;
      }
    } catch (e) {
      console.error("Failed to fetch listings from Firestore:", e);
    }
  }
  try {
    if (fs.existsSync(dbPath)) {
      const fileContent = fs.readFileSync(dbPath, "utf-8");
      return JSON.parse(fileContent);
    }
  } catch (e) {
    console.error("Failed to read local listings database:", e);
  }
  return STATIC_LISTINGS;
};

const getChatsFromDb = async (): Promise<any[]> => {
  if (db) {
    try {
      const snapshot = await getDocs(collection(db, "chats"));
      if (!snapshot.empty) {
        const chats = snapshot.docs.map(doc => doc.data());
        chats.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        return chats;
      }
    } catch (e) {
      console.error("Failed to fetch chats from Firestore:", e);
    }
  }
  try {
    if (fs.existsSync(chatsPath)) {
      return JSON.parse(fs.readFileSync(chatsPath, "utf-8"));
    }
  } catch (e) {}
  return [];
};

const getAnnouncementsFromDb = async (): Promise<any[]> => {
  if (db) {
    try {
      const snapshot = await getDocs(collection(db, "announcements"));
      if (!snapshot.empty) {
        const announcements = snapshot.docs.map(doc => doc.data());
        announcements.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return announcements;
      }
    } catch (e) {
      console.error("Failed to fetch announcements from Firestore:", e);
    }
  }
  try {
    if (fs.existsSync(announcementsPath)) {
      return JSON.parse(fs.readFileSync(announcementsPath, "utf-8"));
    }
  } catch (e) {}
  return [];
};

const getRequestsFromDb = async (): Promise<any[]> => {
  if (db) {
    try {
      const snapshot = await getDocs(collection(db, "requests"));
      if (!snapshot.empty) {
        const requests = snapshot.docs.map(doc => doc.data());
        requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return requests;
      }
    } catch (e) {
      console.error("Failed to fetch requests from Firestore:", e);
    }
  }
  try {
    if (fs.existsSync(requestsPath)) {
      return JSON.parse(fs.readFileSync(requestsPath, "utf-8"));
    }
  } catch (e) {}
  return [];
};

const getUsersFromDb = async (): Promise<any[]> => {
  if (db) {
    try {
      const snapshot = await getDocs(collection(db, "users"));
      if (!snapshot.empty) {
        return snapshot.docs.map(doc => doc.data());
      }
    } catch (e) {
      console.error("Failed to fetch users from Firestore:", e);
    }
  }
  try {
    if (fs.existsSync(usersPath)) {
      return JSON.parse(fs.readFileSync(usersPath, "utf-8"));
    }
  } catch (e) {}
  return [];
};

// Helper database setters
const saveListingsToDb = async (listings: Listing[]) => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(listings, null, 2), "utf-8");
  } catch (e) {}
  if (db) {
    try {
      for (const listing of listings) {
        await setDoc(doc(db, "listings", listing.id), listing);
      }
    } catch (e) {
      console.error("Save listings to Firestore failed:", e);
    }
  }
};

const saveChatsToDb = async (chats: any[]) => {
  try {
    fs.writeFileSync(chatsPath, JSON.stringify(chats, null, 2), "utf-8");
  } catch (e) {}
  if (db) {
    try {
      for (const chat of chats) {
        await setDoc(doc(db, "chats", chat.id), chat);
      }
    } catch (e) {
      console.error("Save chats to Firestore failed:", e);
    }
  }
};

const saveAnnouncementsToDb = async (announcements: any[]) => {
  try {
    fs.writeFileSync(announcementsPath, JSON.stringify(announcements, null, 2), "utf-8");
  } catch (e) {}
  if (db) {
    try {
      for (const ann of announcements) {
        await setDoc(doc(db, "announcements", ann.id), ann);
      }
    } catch (e) {
      console.error("Save announcements failed:", e);
    }
  }
};

const saveRequestsToDb = async (requests: any[]) => {
  try {
    fs.writeFileSync(requestsPath, JSON.stringify(requests, null, 2), "utf-8");
  } catch (e) {}
  if (db) {
    try {
      for (const req of requests) {
        await setDoc(doc(db, "requests", req.id), req);
      }
    } catch (e) {
      console.error("Save requests failed:", e);
    }
  }
};

const saveUsersToDb = async (users: any[]) => {
  try {
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), "utf-8");
  } catch (e) {}
  if (db) {
    try {
      for (const u of users) {
        const safedEmail = u.email.replace(/\./g, "_");
        await setDoc(doc(db, "users", safedEmail), u);
      }
    } catch (e) {
      console.error("Save users failed:", e);
    }
  }
};

// Seeding check on startup to ensure firestore has preset data for beautiful visual layout catalog
const initializeFirestoreDatabases = async () => {
  if (!db) return;
  try {
    // 1. Listings
    const listSnap = await getDocs(collection(db, "listings"));
    if (listSnap.empty) {
      console.log("Seeding listings database...");
      const localListings = fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath, "utf-8")) : STATIC_LISTINGS;
      await saveListingsToDb(localListings);
    }

    // 2. Chats
    const chatSnap = await getDocs(collection(db, "chats"));
    if (chatSnap.empty) {
      console.log("Seeding chats database...");
      const defaultChats = [
        {
          id: "chat-1",
          senderId: "user@example.com",
          senderName: "ዮናስ ሙሉጌታ",
          receiverId: "admin",
          text: "ሰላም ደላላው መድረክ! የቤት ሰራተኛ ማግኘት ፈልጌ ነበር። በዋጋው ላይ መደራደር ይቻላል?",
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
          read: false
        },
        {
          id: "chat-2",
          senderId: "admin",
          senderName: "ደላላው Admin",
          receiverId: "user@example.com",
          text: "ጤና ይስጥልን! አዎ መደራደር ይቻላል። ጥያቄዎን በቅጽ ያስገቡና ወኪሎቻችን ተመራጭ ሰራተኞችን ያቀርቡልዎታል።",
          timestamp: new Date(Date.now() - 3600000 * 1.8).toISOString(),
          read: true
        }
      ];
      await saveChatsToDb(defaultChats);
    }

    // 3. Announcements
    const annSnap = await getDocs(collection(db, "announcements"));
    if (annSnap.empty) {
      console.log("Seeding announcements database...");
      const defaultAnnouncements = [
        {
          id: "ann-1",
          textAm: "ባለ 3 መኝታ ቅንጡ ኮንዶሚኒየም በ30/05/2026 በ12:00:00 (በተሳካ ሁኔታ ተከራይቷል)!",
          textEn: "3 Bed luxury condominium was successfully rented on 30/05/2026 at 12:00:00!",
          timestamp: new Date(Date.now() - 3600000 * 5).toISOString()
        },
        {
          id: "ann-2",
          textAm: "ቶዮታ ቪትዝ 2012 መኪና በ30/05/2026 በ10:30:00 (በተሳካ ሁኔታ ተሽጧል)!",
          textEn: "Toyota Vitz 2012 automobile was successfully sold on 30/05/2026 at 10:30:00!",
          timestamp: new Date(Date.now() - 3600000 * 6).toISOString()
        }
      ];
      await saveAnnouncementsToDb(defaultAnnouncements);
    }

    // 4. Requests
    const reqSnap = await getDocs(collection(db, "requests"));
    if (reqSnap.empty) {
      console.log("Seeding matching requests database...");
      const defaultRequests = [
        {
          id: "req-1",
          name: "ልዑልሰገድ (Leul)",
          phone: "0911******",
          requestType: "house",
          subCategory: "የሚከራይ",
          details: "ቦሌ ብራስ አካባቢ ባለ 3 መኝታ ቤት ዘመናዊ አፓርታማ የሚከራይ በአስቸኳይ እፈልጋለሁ። በጀት እስከ 80,000 ብር።",
          status: "pending",
          createdAt: "2026-05-28T12:30:00Z"
        },
        {
          id: "req-2",
          name: "ሳራ (Sara)",
          phone: "0912******",
          requestType: "servant",
          subCategory: "የቤት",
          details: "ስነ-ምግባር ያላት፣ ህጻናት የምትንከባከብ ሙሉ ግዜ አዳሪ የቤት ሰራተኛ በአስቸኳይ እፈልጋለሁ። ደመወዝ 8,000 ብር።",
          status: "reviewed",
          createdAt: "2026-05-28T10:15:00Z"
        },
        {
          id: "req-3",
          name: "ዮናስ (Yonas)",
          phone: "0930******",
          requestType: "car",
          subCategory: "የሚሸጥ",
          details: "ንፁህ ቶዮታ ያሪስ (Toyota Yaris) ወይም ቫይትዝ መግዛት እፈልጋለሁ። የተሰራበት ዓመት ከ 2010 በላይ ቢሆን ይመረጣል።",
          status: "resolved",
          createdAt: "2026-05-27T16:45:00Z"
        }
      ];
      await saveRequestsToDb(defaultRequests);
    }

    // 5. Users
    const userSnap = await getDocs(collection(db, "users"));
    if (userSnap.empty) {
      console.log("Seeding registered users database...");
      const defaultUsers = [
        { email: 'admin@delalaw.com', password: 'admin123', name: 'ደላላው አስተዳዳሪ', phone: '0914842611', role: 'admin' },
        { email: 'user@example.com', password: 'user123', name: 'ዮናስ ሙሉጌታ', phone: '0911554433', role: 'user' }
      ];
      await saveUsersToDb(defaultUsers);
    }
  } catch (error) {
    console.error("Failed to seed and verify databases:", error);
  }
};

setTimeout(initializeFirestoreDatabases, 1000);

// API Endpoints
api.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

api.get("/api/listings", async (req, res) => {
  try {
    res.json(await getListingsFromDb());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

api.post("/api/listings", async (req, res) => {
  try {
    const newListings = await getListingsFromDb();
    const newListing = req.body;
    // Overlapping prevention via secure random ID tag
    const uniqueNum = Math.floor(1001 + Math.random() * 8999);
    newListing.id = `DL-${uniqueNum}`;
    newListings.unshift(newListing);
    await saveListingsToDb(newListings);
    res.status(201).json(newListing);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

api.put("/api/listings/approve/:id", async (req, res) => {
  try {
    const listings = await getListingsFromDb();
    let found = false;
    const updated = listings.map((l) => {
      if (l.id === req.params.id) {
        found = true;
        return { ...l, status: "approved" as const, phone: "0914842611" };
      }
      return l;
    });
    if (!found) return res.status(404).json({ error: "Listing not found" });
    await saveListingsToDb(updated);
    res.json({ success: true, id: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

api.put("/api/listings/reject/:id", async (req, res) => {
  try {
    const listings = await getListingsFromDb();
    let found = false;
    const updated = listings.map((l) => {
      if (l.id === req.params.id) {
        found = true;
        return { ...l, status: "rejected" as const };
      }
      return l;
    });
    if (!found) return res.status(404).json({ error: "Listing not found" });
    await saveListingsToDb(updated);
    res.json({ success: true, id: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

api.put("/api/listings/:id", async (req, res) => {
  try {
    const listings = await getListingsFromDb();
    let found = false;
    const updated = listings.map((l) => {
      if (l.id === req.params.id) {
        found = true;
        return { ...l, ...req.body };
      }
      return l;
    });
    if (!found) return res.status(404).json({ error: "Listing not found" });
    await saveListingsToDb(updated);
    res.json({ success: true, id: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

api.delete("/api/listings/:id", async (req, res) => {
  try {
    const listings = await getListingsFromDb();
    const filtered = listings.filter((l) => l.id !== req.params.id);
    await saveListingsToDb(filtered);
    if (db) {
      try {
        await deleteDoc(doc(db, "listings", req.params.id));
      } catch (e) {}
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

api.get("/api/chats", async (req, res) => {
  try {
    res.json(await getChatsFromDb());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

api.post("/api/chats", async (req, res) => {
  try {
    const chats = await getChatsFromDb();
    const newMsg = req.body;
    chats.push(newMsg);
    await saveChatsToDb(chats);
    res.status(201).json(newMsg);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

api.post("/api/chats/read", async (req, res) => {
  try {
    const { userMail, role } = req.body;
    const chats = await getChatsFromDb();
    const updatedChats = chats.map(msg => {
      if (role === 'admin') {
        if (msg.senderId === userMail && msg.receiverId === 'admin') {
          return { ...msg, read: true };
        }
      } else {
        if (msg.senderId === 'admin' && msg.receiverId === userMail) {
          return { ...msg, read: true };
        }
      }
      return msg;
    });
    await saveChatsToDb(updatedChats);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

api.get("/api/announcements", async (req, res) => {
  try {
    res.json(await getAnnouncementsFromDb());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

api.post("/api/announcements", async (req, res) => {
  try {
    const announcements = await getAnnouncementsFromDb();
    const newAnn = {
      id: "ann-" + Date.now(),
      textAm: req.body.textAm,
      textEn: req.body.textEn,
      timestamp: new Date().toISOString()
    };
    announcements.unshift(newAnn);
    await saveAnnouncementsToDb(announcements);
    res.status(201).json(newAnn);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

api.get("/api/requests", async (req, res) => {
  try {
    res.json(await getRequestsFromDb());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

api.post("/api/requests", async (req, res) => {
  try {
    const requests = await getRequestsFromDb();
    const newRequest = {
      id: "req-" + Date.now(),
      name: req.body.name,
      phone: req.body.phone,
      requestType: req.body.requestType,
      subCategory: req.body.subCategory,
      details: req.body.details,
      status: req.body.status || "pending",
      createdAt: req.body.createdAt || new Date().toISOString()
    };
    requests.unshift(newRequest);
    await saveRequestsToDb(requests);
    res.status(201).json(newRequest);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

api.put("/api/requests/:id", async (req, res) => {
  try {
    const requests = await getRequestsFromDb();
    let found = false;
    const updated = requests.map((r) => {
      if (r.id === req.params.id) {
        found = true;
        return { ...r, ...req.body };
      }
      return r;
    });
    if (!found) return res.status(404).json({ error: "Request not found" });
    await saveRequestsToDb(updated);
    res.json({ success: true, id: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

api.delete("/api/requests/:id", async (req, res) => {
  try {
    const requests = await getRequestsFromDb();
    const filtered = requests.filter((r) => r.id !== req.params.id);
    await saveRequestsToDb(filtered);
    if (db) {
      try {
        await deleteDoc(doc(db, "requests", req.params.id));
      } catch (e) {}
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Accounts cross-device global endpoints
api.get("/api/users", async (req, res) => {
  try {
    res.json(await getUsersFromDb());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

api.post("/api/users", async (req, res) => {
  try {
    const users = await getUsersFromDb();
    const newUser = req.body;
    if (users.some(u => u.email.toLowerCase() === newUser.email.toLowerCase())) {
      return res.status(400).json({ error: "Email already registered" });
    }
    users.push(newUser);
    await saveUsersToDb(users);
    res.status(201).json(newUser);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export { api as apiMiddleware };
