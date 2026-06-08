import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Lock, Mail, Phone, Shield, Send, CheckCircle, AlertTriangle, 
  Trash2, Edit, Plus, MessageSquare, Clock, Film, UploadCloud, X, Check, Eye
} from 'lucide-react';
import { CategoryType, Listing, UserRequest } from '../types';

interface AuthHubProps {
  isAmharic: boolean;
  listings: Listing[];
  setListings: React.Dispatch<React.SetStateAction<Listing[]>>;
  onClose: () => void;
  currentUser: any;
  setCurrentUser: React.Dispatch<React.SetStateAction<any>>;
  pendingForwardListing?: Listing | null;
  clearPendingForwardListing?: () => void;
}

interface Message {
  id: string;
  senderId: string; // user email or 'admin'
  senderName: string;
  receiverId: string;
  text: string;
  timestamp: string;
  read?: boolean;
}

export function WordByWordMessage({ text }: { text: string }) {
  const words = text.split(/\s+/);
  return (
    <span className="inline-block whitespace-pre-wrap break-words">
      {words.map((word, idx) => (
        <span 
          key={idx} 
          className="inline-block mr-1 opacity-0 animate-word-fade"
          style={{ 
            animationDelay: `${idx * 50}ms`,
            animationFillMode: 'forwards'
          }}
        >
          {word}
        </span>
      ))}
    </span>
  );
}

export function detectTaggedListing(text: string, listings: Listing[]): Listing | null {
  if (!text || !listings || listings.length === 0) return null;
  const lowerText = text.toLowerCase();
  for (const item of listings) {
    const idLower = item.id.toLowerCase();
    const rx = new RegExp(`(?:\\b|#)${idLower}(?:\\b|$|\\s|\\]|\\[)`, 'i');
    if (rx.test(lowerText)) {
      return item;
    }
  }
  return null;
}

export default function AuthHub({ 
  isAmharic, listings, setListings, onClose, currentUser, setCurrentUser,
  pendingForwardListing, clearPendingForwardListing
}: AuthHubProps) {
  // Authentication states
  const [isLogin, setIsLogin] = useState(true);
  
  // Registration / Login Inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Dashboard Active Tab for Users: 'upload' | 'my-posts' | 'chat'
  const [userTab, setUserTab] = useState<'upload' | 'my-posts' | 'chat'>('upload');
  
  // Dashboard Active Tab for Admin: 'pending' | 'all-posts' | 'chats' | 'create-post' | 'history' | 'requests'
  const [adminTab, setAdminTab] = useState<'pending' | 'all-posts' | 'chats' | 'create-post' | 'history' | 'requests'>('pending');
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [userRequests, setUserRequests] = useState<UserRequest[]>([]);

  // Video and Image uploads
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoError, setVideoError] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageFileUrl, setImageFileUrl] = useState('');
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [newAddImageUrl, setNewAddImageUrl] = useState('');
  
  // Custom Post Form inputs
  const [postCategory, setPostCategory] = useState<CategoryType>('house');
  const [postSubCategory, setPostSubCategory] = useState('የሚከራይ');
  const [postTitleAm, setPostTitleAm] = useState('');
  const [postTitleEn, setPostTitleEn] = useState('');
  const [postPrice, setPostPrice] = useState('');
  const [postPriceType, setPostPriceType] = useState<'rent' | 'sale' | 'salary_monthly' | 'salary_negotiable'>('rent');
  const [postDescAm, setPostDescAm] = useState('');
  const [postDescEn, setPostDescEn] = useState('');
  const [postLocAm, setPostLocAm] = useState('');
  const [postLocEn, setPostLocEn] = useState('');
  const [postSpecs, setPostSpecs] = useState<{ keyAm: string; keyEn: string; valueAm: string; valueEn: string }[]>([
    { keyAm: 'ሁኔታ', keyEn: 'Condition', valueAm: 'አዲስ', valueEn: 'New' }
  ]);

  // Edits panel (Admin Crud)
  const [editingPost, setEditingPost] = useState<Listing | null>(null);

  // Chat/Messaging States
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [typedMessage, setTypedMessage] = useState('');
  const [selectedChatUser, setSelectedChatUser] = useState<string>(''); // For admin to pick user
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const [lastMessageCount, setLastMessageCount] = useState<number>(0);
  const isInitialChatsLoad = useRef(true);

  // oscillator beep generator
  const playNotificationSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
      gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.35);
    } catch (e) {
      console.warn('AudioContext beep blocked:', e);
    }
  };

  // Load user session from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('delala_current_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
        if (parsed.role === 'admin') {
          setSelectedChatUser('user@example.com');
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Synchronize registered accounts from global Firestore
  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(cloudUsers => {
        if (Array.isArray(cloudUsers) && cloudUsers.length > 0) {
          const localUsersRaw = localStorage.getItem('delala_registered_users');
          const localUsers = localUsersRaw ? JSON.parse(localUsersRaw) : [];
          const merged = [...localUsers];
          cloudUsers.forEach((cu: any) => {
            if (!merged.some(u => u.email.toLowerCase() === cu.email.toLowerCase())) {
              merged.push(cu);
            }
          });
          localStorage.setItem('delala_registered_users', JSON.stringify(merged));
        }
      })
      .catch(err => console.error("Cloud users sync failed:", err));
  }, []);

  // Load user requests from database server
  useEffect(() => {
    fetch('/api/requests')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setUserRequests(data);
        }
      })
      .catch(err => {
        console.error("Failed to load requests:", err);
      });
  }, []);

  // Poll chats periodically from database server
  useEffect(() => {
    const fetchChats = () => {
      fetch('/api/chats')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            // Only play sound if there are actual new incoming messages
            if (!isInitialChatsLoad.current && data.length > lastMessageCount) {
              const lastMsg = data[data.length - 1];
              // Ensure we don't beep for our own sent messages
              if (currentUser && lastMsg.senderId !== currentUser.email) {
                playNotificationSound();
              }
            }
            setChatMessages(data);
            setLastMessageCount(data.length);
            isInitialChatsLoad.current = false;
          }
        })
        .catch(err => console.error('Chats poll failed:', err));
    };

    fetchChats();
    const interval = setInterval(fetchChats, 3050);
    return () => clearInterval(interval);
  }, [lastMessageCount, currentUser]);

  // Synchronize read status for Admin talking to user room
  useEffect(() => {
    if (currentUser?.role === 'admin' && selectedChatUser && adminTab === 'chats') {
      fetch('/api/chats/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMail: selectedChatUser, role: 'admin' })
      })
      .then(() => {
        setChatMessages(prev => prev.map(m => {
          if (m.senderId === selectedChatUser && m.receiverId === 'admin') {
            return { ...m, read: true };
          }
          return m;
        }));
      })
      .catch(err => console.error('Error marking admin chats read:', err));
    }
  }, [selectedChatUser, adminTab, currentUser]);

  // Fetch transaction history when history tab is active
  useEffect(() => {
    if (adminTab === 'history') {
      fetch('/api/announcements')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setHistoryItems(data);
          }
        })
        .catch(err => console.error('Failed to load transaction history:', err));
    }
  }, [adminTab]);

  // Synchronize read status for registered User talking to admin
  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin' && userTab === 'chat') {
      fetch('/api/chats/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMail: currentUser.email, role: 'user' })
      })
      .then(() => {
        setChatMessages(prev => prev.map(m => {
          if (m.senderId === 'admin' && m.receiverId === currentUser.email) {
            return { ...m, read: true };
          }
          return m;
        }));
      })
      .catch(err => console.error('Error marking user chats read:', err));
    }
  }, [userTab, currentUser]);

  // Handle immediate listing product forwarding when requested
  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin' && pendingForwardListing) {
      setUserTab('chat');
      
      const amPrice = pendingForwardListing.price 
        ? `${new Intl.NumberFormat('en-US').format(pendingForwardListing.price)} Birr` 
        : 'ድርድር';
      const enPrice = pendingForwardListing.price 
        ? `${new Intl.NumberFormat('en-US').format(pendingForwardListing.price)} Birr` 
        : 'Negotiable';
        
      const forwardText = isAmharic 
        ? `[የምርት/አገልግሎት ማስተላለፊያ] ሰላም አስተዳዳሪ፤ ይህንን አገልግሎት ማግኘት እፈልጋለሁ። የተያያዘ ፖስት መለያ ID፡ [ID: ${pendingForwardListing.id}]\nርዕስ፡ ${pendingForwardListing.titleAm}\nዋጋ፡ ${amPrice}\nቦታ፡ ${pendingForwardListing.locationAm}`
        : `[Listing Product Forward] Hello admin, I am interested in this listing. Attached post ID: [ID: ${pendingForwardListing.id}]\nTitle: ${pendingForwardListing.titleEn}\nPrice: ${enPrice}\nLocation: ${pendingForwardListing.locationEn}`;
        
      const newMsg: Message = {
        id: 'msg-' + Date.now(),
        senderId: currentUser.email,
        senderName: currentUser.name,
        receiverId: 'admin',
        text: forwardText,
        timestamp: new Date().toISOString(),
        read: false
      };
      
      fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMsg)
      })
      .then(() => fetch('/api/chats'))
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setChatMessages(data);
          setLastMessageCount(data.length);
        }
      })
      .catch(err => console.error('Forward text failed to commit:', err));
      
      if (clearPendingForwardListing) {
        clearPendingForwardListing();
      }
    }
  }, [currentUser, pendingForwardListing]);

  // Scroll to bottom of chat
  useEffect(() => {
    // Disabled auto-scroll as requested
    // chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, userTab, adminTab]);

  // Save chats persistent broker helper to sync messages to server database/Firestore
  const saveChats = (newChats: Message[]) => {
    // Find messages in newChats that don't exist in our state chatMessages yet
    const existingIds = new Set(chatMessages.map(m => m.id));
    const newMsgs = newChats.filter(m => !existingIds.has(m.id));

    newMsgs.forEach(msg => {
      fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msg)
      })
      .then(res => {
        if (!res.ok) throw new Error('Unsuccessful chat save response');
        return res.json();
      })
      .then(() => {
        // Optimistically add to state if not already there
        setChatMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          const updated = [...prev, msg];
          setLastMessageCount(updated.length);
          return updated;
        });
      })
      .catch(err => {
        console.error('Error saving chat message to server:', err);
        // Fallback to local state update if backend is unreachable
        setChatMessages(newChats);
      });
    });
  };

  // Pre-seed mock accounts on first load
  const getUsersList = () => {
    const users = localStorage.getItem('delala_registered_users');
    if (users) {
      return JSON.parse(users);
    }
    const defaultUsers = [
      { email: 'admin@delalaw.com', password: 'admin123', name: 'ደላላው አስተዳዳሪ', phone: '0914842611', role: 'admin' },
      { email: 'user@example.com', password: 'user123', name: 'ዮናስ ሙሉጌታ', phone: '0911554433', role: 'user' }
    ];
    localStorage.setItem('delala_registered_users', JSON.stringify(defaultUsers));
    return defaultUsers;
  };

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!email.trim() || !password.trim()) {
      setAuthError(isAmharic ? 'እባክዎ ሁሉንም መረጃዎች ያስገቡ' : 'Please fill all fields');
      return;
    }

    fetch('/api/users')
      .then(res => res.json())
      .then(cloudUsers => {
        if (Array.isArray(cloudUsers) && cloudUsers.length > 0) {
          const localUsersRaw = localStorage.getItem('delala_registered_users');
          const localUsers = localUsersRaw ? JSON.parse(localUsersRaw) : [];
          const merged = [...localUsers];
          cloudUsers.forEach((cu: any) => {
            if (!merged.some(u => u.email.toLowerCase() === cu.email.toLowerCase())) {
              merged.push(cu);
            }
          });
          localStorage.setItem('delala_registered_users', JSON.stringify(merged));
        }

        const users = getUsersList();
        const found = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

        if (found) {
          setCurrentUser(found);
          localStorage.setItem('delala_current_user', JSON.stringify(found));
          setAuthSuccess(isAmharic ? 'በተሳካ ሁኔታ ገብተዋል!' : 'Login successful!');
          setEmail('');
          setPassword('');
          if (found.role === 'admin') {
            setSelectedChatUser('user@example.com');
          }
        } else {
          setAuthError(isAmharic ? 'የኢሜል ወይም የይለፍ ቃል ስህተት ነው' : 'Invalid email or password');
        }
      })
      .catch(err => {
        console.error("Cloud login sync failed, falling back to cached lookup:", err);
        const users = getUsersList();
        const found = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

        if (found) {
          setCurrentUser(found);
          localStorage.setItem('delala_current_user', JSON.stringify(found));
          setAuthSuccess(isAmharic ? 'በተሳካ ሁኔታ ገብተዋል!' : 'Login successful!');
          setEmail('');
          setPassword('');
          if (found.role === 'admin') {
            setSelectedChatUser('user@example.com');
          }
        } else {
          setAuthError(isAmharic ? 'የኢሜል ወይም የይለፍ ቃል ስህተት ነው' : 'Invalid email or password');
        }
      });
  };

  // Sign up handler
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!email.trim() || !password.trim() || !name.trim() || !phone.trim()) {
      setAuthError(isAmharic ? 'እባክዎ ሁሉንም መረጃዎች ያስገቡ' : 'Please fill all fields');
      return;
    }

    const users = getUsersList();
    const exists = users.some((u: any) => u.email.toLowerCase() === email.toLowerCase());

    if (exists) {
      setAuthError(isAmharic ? 'ይህ ኢሜል ቀደም ብሎ ተመዝግቧል' : 'Email already registered');
      return;
    }

    const newUser = {
      email: email.trim().toLowerCase(),
      password: password.trim(),
      name: name.trim(),
      phone: phone.trim(),
      role: 'user'
    };

    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    })
    .catch(err => console.error("Cloud registration sync failure:", err));

    const updated = [...users, newUser];
    localStorage.setItem('delala_registered_users', JSON.stringify(updated));
    
    // Set active session
    setCurrentUser(newUser);
    localStorage.setItem('delala_current_user', JSON.stringify(newUser));
    setAuthSuccess(isAmharic ? 'በተሳካ ሁኔታ ተመዝግበዋል!' : 'Registration successful!');
    
    // reset inputs
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
  };

  // Logout Handler
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('delala_current_user');
    setAuthSuccess('');
    setAuthError('');
  };

  // Handle local image file selection
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageFile(null);
    setImageFileUrl('');
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const localUrl = URL.createObjectURL(file);
    setImageFileUrl(localUrl);
  };

  // Handle multiple images file selection
  const handleMultipleImagesFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const filesList = Array.from(files) as File[];
    filesList.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setAdditionalImages(prev => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Get dynamic subcategory list for dropdown options
  const getSubCategoryOptions = (category: CategoryType) => {
    if (category === 'house' || category === 'car') {
      return [
        { val: 'የሚከራይ', nameAm: 'የሚከራይ / To Rent', nameEn: 'To Rent' },
        { val: 'የሚሸጥ', nameAm: 'የሚሸጥ / To Sell', nameEn: 'To Sell' }
      ];
    } else {
      return [
        { val: 'የቤት', nameAm: 'የቤት ሰራተኛ / House Worker', nameEn: 'House Worker' },
        { val: 'ተመላላሽ', nameAm: 'ተመላላሽ ሰራተኛ / Part-time Helper', nameEn: 'Part-time Helper' },
        { val: 'ፅዳት', nameAm: 'ፅዳት / Cleaning Assist', nameEn: 'Cleaning Assist' },
        { val: 'ጥበቃ', nameAm: 'ጥበቃ / Security Guard', nameEn: 'Security Guard' },
        { val: 'አስተናጋጅ', nameAm: 'አስተናጋጅ / Waiter-Waitress', nameEn: 'Waiter-Waitress' },
        { val: 'ካሼር', nameAm: 'ካሼር / Cashier', nameEn: 'Cashier' },
        { val: 'ባር ማን', nameAm: 'ባር ማን / Barman', nameEn: 'Barman' },
        { val: 'ሌሎችም', nameAm: 'ሌሎችም / Others', nameEn: 'Others' }
      ];
    }
  };

  // Get dynamic description placeholder/hint
  const getDescriptionPlaceholder = (category: CategoryType, isAmharic: boolean) => {
    if (category === 'house') {
      return isAmharic 
        ? "ለምሳሌ፡ ቤቱ 3 መታጠቢያ ቤት ያለው፣ ሰፊ ሳሎን፣ ዘመናዊ የውሃ ማጠраቀሚያ፣ ቦሌ አካባቢ የሚገኝ..."
        : "e.g. 3-bedroom luxury villa in Bole, spacious kitchen, garden, backup water tank, quiet neighborhood...";
    } else if (category === 'car') {
      return isAmharic 
        ? "ለምሳሌ፡ የሚሸጥ ቶዮታ ቪትዝ 2012 ሞዴል፣ አውቶማቲክ፣ መስታወት ኤሌክትሪክ፣ ምንም ቀለም ያልተደገመ..."
        : "e.g. Toyota Vitz 2012 automatic, low mileage, original paint, excellent AC, fuel efficient...";
    } else {
      return isAmharic 
        ? "ለምሳሌ፡ የቤት ሰራተኛ - ምግብ የምትችል፣ ታማኝ፣ የዘንድሮ የምስክር ወረቀት ያላት፣ ቦሌ አካባቢ የምትሰራ..."
        : "e.g. Vetted housemaid - experienced in cooking and cleaning, honest, has recommendation letters...";
    }
  };

  // Handle Video Choice and Size Checking (30MB Limit validation)
  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoError('');
    setVideoFile(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // 30MB limit check: 30 * 1024 * 1024 bytes
    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > 30) {
      setVideoError(isAmharic 
        ? `የቪዲዮው መጠን ${sizeInMB.toFixed(1)}MB ነው። እባክዎ ከ 30MB ያነሰ ቪዲዮ ይጫኑ!`
        : `Video size is ${sizeInMB.toFixed(1)}MB. Limit is 30MB! Choose a smaller file.`
      );
      return;
    }

    setVideoFile(file);
    // Setup simulated preview URL
    const previewUrl = URL.createObjectURL(file);
    setVideoUrl(previewUrl);
  };

  // Submit Listing Request (Wait for approval)
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitleAm.trim() || !postTitleEn.trim()) {
      alert(isAmharic ? 'ርዕሶች ማስገባት ግዴታ ነው' : 'Titles are required');
      return;
    }

    // Set fallback image if empty
    const finalImage = imageFileUrl || imageUrl.trim() || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80';

    const newListing: Listing & { status: string; video?: string; realOwnerPhone?: string; realOwnerName?: string } = {
      id: 'usr-lst-' + Date.now(),
      category: postCategory,
      subCategory: postSubCategory,
      titleAm: postTitleAm.trim(),
      titleEn: postTitleEn.trim(),
      descriptionAm: postDescAm.trim() || (isAmharic ? 'ዝርዝር መረጃ የለም' : 'No description provided'),
      descriptionEn: postDescEn.trim() || (isAmharic ? 'ዝርዝር መረጃ የለም' : 'No description provided'),
      price: postPrice.trim() ? parseFloat(postPrice) : undefined,
      priceType: postPriceType,
      locationAm: postLocAm.trim() || (isAmharic ? 'አዲስ አበባ' : 'Addis Ababa'),
      locationEn: postLocEn.trim() || (isAmharic ? 'አዲስ አበባ' : 'Addis Ababa'),
      image: finalImage,
      images: additionalImages,
      video: videoUrl || undefined,
      // For public safety, we instantly route the display call list to Admin 0914842611
      phone: '0914842611',
      // Real owner gets saved privately on the admin side
      realOwnerPhone: currentUser.phone || '0911223344',
      realOwnerName: currentUser.name || currentUser.email,
      specifications: postSpecs,
      dateAdded: new Date().toISOString().split('T')[0],
      // If of role admin, immediately approve, otherwise 'pending'
      status: currentUser.role === 'admin' ? 'approved' : 'pending'
    };

    // Save to server database
    fetch('/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newListing)
    })
      .then(res => {
        if (!res.ok) throw new Error('Database server error');
        return res.json();
      })
      .then(() => fetch('/api/listings'))
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setListings(data);
          localStorage.setItem('delala_listings', JSON.stringify(data));
        }
      })
      .catch(err => {
        console.error('Server save failed, falling back to local action:', err);
        const newAllListings = [newListing, ...listings];
        setListings(newAllListings);
        localStorage.setItem('delala_listings', JSON.stringify(newAllListings));
      });

    alert(currentUser.role === 'admin' 
      ? (isAmharic ? 'ማስታወቂያው በተሳካ ሁኔታ ተለጥፏል!' : 'Post instantly published!')
      : (isAmharic ? 'ማስታወቂያው ተመዝግቧል! ከአስተዳዳሪ ማረጋገጫ (Approval) በኋላ በ0914842611 ታይቶ ይለቀቃል።' : 'Draft pending admin approval. Display phone will switch to 0914842611.')
    );

    // Reset fields
    setPostTitleAm('');
    setPostTitleEn('');
    setPostPrice('');
    setPostDescAm('');
    setPostDescEn('');
    setPostLocAm('');
    setPostLocEn('');
    setImageUrl('');
    setImageFile(null);
    setImageFileUrl('');
    setAdditionalImages([]);
    setNewAddImageUrl('');
    setVideoFile(null);
    setVideoUrl('');
    
    // Switch menu
    if (currentUser.role === 'admin') {
      setAdminTab('all-posts');
    } else {
      setUserTab('my-posts');
    }
  };

  // Mark as rented / sold and create automatic timestamped announcement
  const handleMarkRentedSold = (listing: Listing) => {
    let newStatus: 'rented' | 'sold' | 'hired' = 'rented';
    if (listing.category === 'house') newStatus = 'rented';
    else if (listing.category === 'car') newStatus = 'sold';
    else newStatus = 'hired';

    const amharicVerb = newStatus === 'rented' ? 'ተከራይቷል' : newStatus === 'sold' ? 'ተሽጧል' : 'ተቀጥሯል';
    const englishVerb = newStatus === 'rented' ? 'rented' : newStatus === 'sold' ? 'sold' : 'placed/hired';
    
    const formattedDate = new Date().toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const formattedTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const amharicText = `${listing.category === 'house' ? '🏠 ቤት' : listing.category === 'car' ? '🚗 መኪና' : '💼 ሰራተኛ'} [${listing.titleAm}] በ ${formattedDate} በ ${formattedTime} (በአስተዳዳሪው ማረጋገጫ ${amharicVerb})!`;
    const englishText = `${listing.category === 'house' ? '🏠 House' : listing.category === 'car' ? '🚗 Automobile' : '💼 Professional'} [${listing.titleEn}] was successfully ${englishVerb} on ${formattedDate} at ${formattedTime}!`;

    fetch(`/api/listings/${listing.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
      .then(res => {
        if (!res.ok) throw new Error('Unsuccessful status update');
        return res.json();
      })
      .then(() => {
        return fetch('/api/announcements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ textAm: amharicText, textEn: englishText })
        });
      })
      .then(() => fetch('/api/listings'))
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setListings(data);
          localStorage.setItem('delala_listings', JSON.stringify(data));
        }
        alert(isAmharic 
          ? `በተሳካ ሁኔታ ድርጊቱ ተመዝግቧል። ፖስቱ ተከራይቷል/ተሽጧል መሆኑ በሆን ፔጅ ፖስት ላይ እንዲታወቅ ተደርጓል!` 
          : `Transaction logged. Public announcement timestamped and published to homepage!`
        );
      })
      .catch(err => {
        console.error(err);
        alert('Error saving status changes');
      });
  };

  // Delete Listing (Admin CRUD)
  const handleDeletePost = (id: string) => {
    if (window.confirm(isAmharic ? 'ማስታወቂያውን መሰረዝ ይፈልጋሉ?' : 'Are you sure to delete this post?')) {
      fetch(`/api/listings/${id}`, {
        method: 'DELETE'
      })
        .then(res => {
          if (!res.ok) throw new Error('Delete database server error');
          return res.json();
        })
        .then(() => fetch('/api/listings'))
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setListings(data);
            localStorage.setItem('delala_listings', JSON.stringify(data));
          }
        })
        .catch(err => {
          console.error('Server delete failed, falling back:', err);
          const filtered = listings.filter(l => l.id !== id);
          setListings(filtered);
          localStorage.setItem('delala_listings', JSON.stringify(filtered));
        });
    }
  };

  // Toggle/Set Editing Listing (Admin Edit pane)
  const handleStartEdit = (listing: Listing) => {
    setEditingPost(listing);
    setPostCategory(listing.category);
    setPostSubCategory(listing.subCategory);
    setPostTitleAm(listing.titleAm);
    setPostTitleEn(listing.titleEn);
    setPostPrice(listing.price ? listing.price.toString() : '');
    setPostPriceType(listing.priceType || 'rent');
    setPostDescAm(listing.descriptionAm);
    setPostDescEn(listing.descriptionEn);
    setPostLocAm(listing.locationAm);
    setPostLocEn(listing.locationEn);
    setImageUrl(listing.image);
    setAdditionalImages(listing.images || []);
  };

  // Save changes on editing (Admin Edit CRUD save)
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;

    const finalImage = imageFileUrl || imageUrl;

    const payload = {
      category: postCategory,
      subCategory: postSubCategory,
      titleAm: postTitleAm,
      titleEn: postTitleEn,
      price: postPrice ? parseFloat(postPrice) : undefined,
      priceType: postPriceType,
      descriptionAm: postDescAm,
      descriptionEn: postDescEn,
      locationAm: postLocAm,
      locationEn: postLocEn,
      image: finalImage,
      images: additionalImages
    };

    fetch(`/api/listings/${editingPost.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error('Update database server error');
        return res.json();
      })
      .then(() => fetch('/api/listings'))
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setListings(data);
          localStorage.setItem('delala_listings', JSON.stringify(data));
        }
      })
      .catch(err => {
        console.error('Server edit save failed, falling back:', err);
        const updated = listings.map(l => {
          if (l.id === editingPost.id) {
            return {
              ...l,
              ...payload
            };
          }
          return l;
        });
        setListings(updated);
        localStorage.setItem('delala_listings', JSON.stringify(updated));
      });

    setEditingPost(null);
    setImageFileUrl('');
    setImageFile(null);
    setAdditionalImages([]);
    setNewAddImageUrl('');
    alert(isAmharic ? 'ለውጡ ተቀምጧል!' : 'Changes successfully saved!');
  };

  // Approve pending User Post (Admin action)
  const handleApprovePost = (id: string) => {
    fetch(`/api/listings/approve/${id}`, {
      method: 'PUT'
    })
      .then(res => {
        if (!res.ok) throw new Error('Approve database server error');
        return res.json();
      })
      .then(() => fetch('/api/listings'))
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setListings(data);
          localStorage.setItem('delala_listings', JSON.stringify(data));
        }
      })
      .catch(err => {
        console.error('Server approve failed, falling back:', err);
        const updated = listings.map(l => {
          if (l.id === id) {
            return { ...l, status: 'approved', phone: '0914842611' };
          }
          return l;
        });
        setListings(updated);
        localStorage.setItem('delala_listings', JSON.stringify(updated));
      });

    alert(isAmharic ? 'ፖስቱ ተቀባይነት አግኝቶ ተለቋል!' : 'Post successfully approved and published with admin contact 0914842611!');
  };

  // Reject/Spam pending user post
  const handleRejectPost = (id: string) => {
    fetch(`/api/listings/reject/${id}`, {
      method: 'PUT'
    })
      .then(res => {
        if (!res.ok) throw new Error('Reject database server error');
        return res.json();
      })
      .then(() => fetch('/api/listings'))
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setListings(data);
          localStorage.setItem('delala_listings', JSON.stringify(data));
        }
      })
      .catch(err => {
        console.error('Server reject failed, falling back:', err);
        const updated = listings.map(l => {
          if (l.id === id) {
            return { ...l, status: 'rejected' };
          }
          return l;
        });
        setListings(updated);
        localStorage.setItem('delala_listings', JSON.stringify(updated));
      });

    alert(isAmharic ? 'ፖስቱ ውድቅ ተደርጓል' : 'Post rejected');
  };

  // Chat message send handler
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() || !currentUser) return;

    const isUserAdmin = currentUser.role === 'admin';
    const receiverId = isUserAdmin ? selectedChatUser : 'admin';

    const newMsg: Message = {
      id: 'msg-' + Date.now(),
      senderId: currentUser.email,
      senderName: currentUser.name,
      receiverId: receiverId,
      text: typedMessage.trim(),
      timestamp: new Date().toISOString()
    };

    const newChats = [...chatMessages, newMsg];
    saveChats(newChats);
    setTypedMessage('');

    // If sent to admin by normal user, trigger automatic smart helper response from Admin desk 2 seconds later
    if (!isUserAdmin) {
      setTimeout(() => {
        const autoReply: Message = {
          id: 'auto-msg-' + Date.now(),
          senderId: 'admin',
          senderName: 'ደላላው አስተዳዳሪ',
          receiverId: currentUser.email,
          text: isAmharic 
            ? `ሰላም ${currentUser.name}! ጥያቄዎን ተቀብለናል፤ ወኪላችን በዚሁ ቻት ወይም በስልክ መስመርዎ (${currentUser.phone}) በቅርቡ መልስ ይሰጥዎታል።` 
            : `Hello ${currentUser.name}! We have received your inquiry. Our support broker agent will connect back on this chat or call you directly on ${currentUser.phone} shortly.`,
          timestamp: new Date().toISOString()
        };
        // Avoid duplicate auto replies if they have already replied
        saveChats([...newChats, autoReply]);
      }, 1500);
    }
  };

  // Filter messages for current viewable chat thread
  const getThreadMessages = () => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') {
      // Admin talking to selectedChatUser
      return chatMessages.filter(
        m => (m.senderId === 'admin' && m.receiverId === selectedChatUser) ||
             (m.senderId === selectedChatUser && m.receiverId === 'admin')
      );
    } else {
      // Normal user talking to admin
      return chatMessages.filter(
        m => (m.senderId === currentUser.email && m.receiverId === 'admin') ||
             (m.senderId === 'admin' && m.receiverId === currentUser.email)
      );
    }
  };

  // Get list of users who have sent messages (for Admin Chat selector view)
  const getMessagingUsers = () => {
    const usersSet = new Set<string>();
    chatMessages.forEach(m => {
      if (m.senderId !== 'admin') usersSet.add(m.senderId);
      if (m.receiverId !== 'admin') usersSet.add(m.receiverId);
    });
    return Array.from(usersSet);
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-150 p-6 md:p-8 shadow-2xl relative font-sans animate-fade-in" id="auth-hub-container">
      {/* Absolute close button */}
      <button 
        id="close-auth-hub-btn"
        onClick={onClose}
        className="absolute top-6 right-6 p-2 rounded-full hover:bg-stone-50 text-stone-400 hover:text-stone-750 transition-colors pointer-events-auto cursor-pointer"
        title={isAmharic ? 'ዝጋ' : 'Close'}
      >
        <X className="w-5 h-5" />
      </button>

      {/* 1. Header Portion with 3px spacing to subsequent buttons */}
      <div className="flex items-center space-x-3 mb-5">
        <div className="w-12 h-12 bg-natural-accent rounded-2xl flex items-center justify-center text-white shadow-md shadow-natural-accent/15">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-black text-stone-900 tracking-tight">
            {currentUser 
              ? (currentUser.role === 'admin' ? (isAmharic ? 'ደላላው አስተዳዳሪ ሰሌዳ (Admin Control)' : 'Delalaw Admin Console') : (isAmharic ? 'የደንበኛ መግቢያ ሰሌዳ (User Hub)' : 'User Account Dashboard'))
              : (isLogin ? (isAmharic ? 'ደህንነቱ የተጠበቀ መግቢያ' : 'Secure Member Login') : (isAmharic ? 'አዲስ አካውንት መመዝገቢያ' : 'Register New Account'))
            }
          </h2>
          {/* Strict 3px vertical spacing constraint where descriptive text meets buttons right below */}
          <p className="text-stone-400 text-xs font-semibold uppercase tracking-wider mb-[3px] font-sans">
            {currentUser 
              ? `${isAmharic ? 'እንኳን ደህና መጡ' : 'Welcome back'}, ${currentUser.name} (${currentUser.role.toUpperCase()})` 
              : (isLogin ? (isAmharic ? 'ማስታወቂያዎችን ለመለጠፍ እና ደላላ ለማግኘት ይግቡ' : 'Log in to post catalog items and chat live with staff') : (isAmharic ? 'ፈጣን መለያ በደቂቃዎች ውስጥ ይፍጠሩ' : 'Create an account to get professional broker matching'))
            }
          </p>
        </div>
      </div>

      {/* 2. Anonymous Auth Screen (Login / Register) */}
      {!currentUser ? (
        <div className="max-w-md mx-auto py-4 bg-stone-50/50 p-6 rounded-2xl border border-stone-100" id="anonymous-auth-panel">
          {authError && (
            <div className="p-3 mb-4 bg-rose-50 rounded-xl border border-rose-100 flex items-center space-x-2 text-rose-800 text-xs font-semibold animate-shake">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}
          {authSuccess && (
            <div className="p-3 mb-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center space-x-2 text-emerald-800 text-xs font-semibold animate-fade-in">
              <Check className="w-4 h-4 shrink-0" />
              <span>{authSuccess}</span>
            </div>
          )}

          <form onSubmit={isLogin ? handleLogin : handleSignUp} className="space-y-[3px]">
            {/* Promo banner for newly registered users */}
            {!isLogin && (
              <div className="mb-3.5 bg-[#C19A6B]/10 border border-[#C19A6B]/15 text-[#8B4513] text-[10.5px] font-bold p-2.5 rounded-xl flex items-center space-x-2 font-sans select-none animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                <span>
                  {isAmharic 
                    ? 'አስደሳች ዜና፡ አዲስ ተመዝጋቢዎች እስከ 30MB ቪዲዮ መለጠፍ ይችላሉ!' 
                    : 'Bonus: Newly registered users can publish showcase videos up to 30MB!'}
                </span>
              </div>
            )}

            {/* Full Name (Show only for register) */}
            {!isLogin && (
              <div>
                <label className="block text-stone-600 text-xs font-medium pl-1 mb-[3px]">
                  {isAmharic ? 'ሙሉ ስም' : 'Full Name'}
                </label>
                <div className="relative mb-3">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    id="auth-signup-name-input"
                    type="text"
                    required
                    placeholder={isAmharic ? 'ስም ያስገቡ' : 'e.g. Mekashaw Mulugeta'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:border-natural-accent outline-hidden text-xs bg-white text-stone-900 font-sans"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-stone-600 text-xs font-medium pl-1 mb-[3px]">
                {isAmharic ? 'ኢሜል' : 'Email Address'}
              </label>
              <div className="relative mb-3">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="auth-login-email-input"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:border-natural-accent outline-hidden text-xs bg-white text-stone-900 font-sans"
                />
              </div>
            </div>

            {/* Phone (Only for register) */}
            {!isLogin && (
              <div>
                <label className="block text-stone-600 text-xs font-medium pl-1 mb-[3px]">
                  {isAmharic ? 'ስልክ ቁጥር' : 'Contact Phone'}
                </label>
                <div className="relative mb-3">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    id="auth-signup-phone-input"
                    type="tel"
                    required
                    placeholder="0911223344"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:border-natural-accent outline-hidden text-xs bg-white text-stone-900 font-sans"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-stone-600 text-xs font-medium pl-1 mb-[3px]">
                {isAmharic ? 'የይለፍ ቃል' : 'Password'}
              </label>
              <div className="relative mb-4">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="auth-login-pass-input"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:border-natural-accent outline-hidden text-xs bg-white text-stone-900 font-sans"
                />
              </div>
            </div>

            {/* Submit button with strictly 3px vertical top-spacing from the preceding inputs */}
            <button
              id="auth-submit-btn"
              type="submit"
              className="w-full py-2.5 px-4 bg-natural-accent hover:bg-natural-accent/90 text-white font-bold rounded-xl text-xs transition-transform transform active:scale-97 pointer-events-auto cursor-pointer flex items-center justify-center space-x-2 shadow-xs"
            >
              <span>{isLogin ? (isAmharic ? 'ግቡ' : 'Log In') : (isAmharic ? 'ተመዝገቡ' : 'Complete Registration')}</span>
            </button>
          </form>

          {/* Quick toggle option with 3px spacing to text & button */}
          <div className="mt-5 text-center text-xs space-y-[3px]">
            <p className="text-stone-400 font-sans">
              {isLogin ? (isAmharic ? 'ነጻ መለያ የለዎትም?' : 'Do not have an account?') : (isAmharic ? 'ቀደም ብሎ አካውንት ፈጥረዋል?' : 'Already have an account?')}
            </p>
            <button
              id="auth-toggle-btn"
              onClick={() => {
                setIsLogin(!isLogin);
                setAuthError('');
              }}
              className="text-natural-dark hover:text-natural-accent font-bold active:scale-98 underline transition-all pointer-events-auto cursor-pointer mb-[3px]"
            >
              {isLogin ? (isAmharic ? 'እዚህ አዲስ መለያ ይመዝግቡ' : 'Register Here') : (isAmharic ? 'ይግቡ' : 'Log In Here')}
            </button>

            {/* Quick Demo Assist Block */}
            <div className="mt-4 pt-3 border-t border-stone-200/60 bg-stone-100/60 p-3 rounded-lg text-left">
              <span className="text-[9px] bg-[#C19A6B]/20 text-[#8B4513] font-bold px-1.5 py-0.5 rounded uppercase">
                Demo Accounts
              </span>
              <div className="grid grid-cols-2 gap-2 mt-2 font-mono text-[9px] text-stone-600">
                <div>
                  <p className="font-bold">Admin Panel:</p>
                  <p>admin@delalaw.com</p>
                  <p>Pass: admin123</p>
                </div>
                <div>
                  <p className="font-bold">Normal User:</p>
                  <p>user@example.com</p>
                  <p>Pass: user123</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (

        // 3. LOGGED-IN HUB (DASHBOARD VIEWS)
        <div id="authenticated-hub-panel">
          {/* Header logout action */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-50 border border-stone-150 p-4 rounded-2xl mb-6">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-full bg-[#C19A6B]/15 text-[#8B4513] flex items-center justify-center font-bold text-sm">
                {currentUser.name[0]}
              </div>
              <div>
                <p className="text-xs font-black text-stone-800 leading-tight">{currentUser.name}</p>
                <p className="text-[10px] text-stone-500 font-mono">{currentUser.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                id="hub-logout-btn"
                onClick={handleLogout}
                className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 rounded-lg text-[10px] font-bold transition-all pointer-events-auto cursor-pointer"
              >
                {isAmharic ? 'ውጣ (Log Out)' : 'Sign Out'}
              </button>
            </div>
          </div>

          {/* 3A. ADMIN CONTROL PANEL */}
          {currentUser.role === 'admin' ? (
            <div id="admin-panel-view">
              
              {editingPost && (
                <div className="bg-amber-50/50 border border-amber-500/30 p-5 rounded-2xl mb-6 shadow-md animate-fade-in" id="listings-inline-editor">
                  <div className="flex items-center justify-between border-b border-amber-200 pb-2 mb-4">
                    <p className="text-xs font-black text-[#8B4513]">
                      ✏️ {isAmharic ? 'የማስታወቂያ መረጃን ማረሚያ' : 'Vetting Editor Panel'}: #{editingPost.id} ({editingPost.status === 'pending' ? (isAmharic ? 'የሚጠባበቅ ጥያቄ' : 'Pending Verification') : (isAmharic ? 'የፀደቀ ማስታወቂያ' : 'Approved')})
                    </p>
                    <button 
                      onClick={() => {
                        setEditingPost(null);
                        setImageFileUrl('');
                        setImageFile(null);
                      }}
                      className="text-[#8B4513] hover:bg-amber-100 p-1 rounded-lg cursor-pointer block"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <form onSubmit={handleSaveEdit} className="space-y-3 font-sans text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Amharic Title</label>
                        <input 
                          type="text" 
                          required 
                          value={postTitleAm} 
                          onChange={(e) => setPostTitleAm(e.target.value)}
                          className="w-full p-2 border border-stone-300 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">English Title</label>
                        <input 
                          type="text" 
                          required 
                          value={postTitleEn} 
                          onChange={(e) => setPostTitleEn(e.target.value)}
                          className="w-full p-2 border border-stone-300 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Price (ETB)</label>
                        <input 
                          type="number" 
                          value={postPrice} 
                          onChange={(e) => setPostPrice(e.target.value)}
                          className="w-full p-2 border border-stone-300 rounded-lg text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Location Amharic</label>
                        <input 
                          type="text" 
                          value={postLocAm} 
                          onChange={(e) => setPostLocAm(e.target.value)}
                          className="w-full p-2 border border-stone-300 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Amharic Description</label>
                        <textarea 
                          rows={3}
                          value={postDescAm} 
                          onChange={(e) => setPostDescAm(e.target.value)}
                          className="w-full p-2 border border-stone-300 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">English Description</label>
                        <textarea 
                          rows={3}
                          value={postDescEn} 
                          onChange={(e) => setPostDescEn(e.target.value)}
                          className="w-full p-2 border border-stone-300 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        {isAmharic ? 'ምስል / ፎቶ ይምረጡ' : 'Select Photo / Image'}
                      </label>
                      <div className="space-y-1">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleImageFileChange}
                          className="w-full text-xs font-sans text-stone-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border file:border-[#C19A6B]/30 file:text-[10px] file:font-semibold file:bg-white file:text-[#8B4513] hover:file:bg-natural-light/50 cursor-pointer"
                        />
                        <input 
                          type="text" 
                          placeholder={isAmharic ? "ወይም የምስል ሊንክ እዚህ ያስገቡ..." : "Or paste image URL..."}
                          value={imageUrl} 
                          onChange={(e) => setImageUrl(e.target.value)}
                          className="w-full p-2.5 border border-stone-300 rounded-lg text-xs font-mono bg-white text-stone-900"
                        />
                      </div>
                      {imageFileUrl && (
                        <div className="mt-1 flex items-center space-x-1.5">
                          <span className="text-[9px] text-emerald-700 font-bold">✓ {isAmharic ? 'ምስል ተመርጧል' : 'Selected'}</span>
                          <img src={imageFileUrl} className="w-8 h-8 rounded object-cover border" alt="Preview" />
                        </div>
                      )}
                    </div>

                    {/* Additional Multiple Images */}
                    <div className="mt-4 p-4 bg-stone-100 rounded-2xl border border-stone-200">
                      <label className="block text-stone-700 text-xs font-bold mb-2">
                        ✨ {isAmharic ? 'የቀሩት ተጨማሪ ምስሎች (ጋለሪ)' : 'Additional Gallery Photos (Multiple)'}
                      </label>
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input 
                            type="file" 
                            multiple
                            accept="image/*"
                            onChange={handleMultipleImagesFileChange}
                            className="flex-1 text-xs font-sans text-stone-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-[#C19A6B]/30 file:text-[10px] file:font-semibold file:bg-white file:text-[#8B4513] hover:file:bg-natural-light/50 cursor-pointer"
                          />
                          <div className="flex gap-1.5">
                            <input 
                              type="text" 
                              placeholder={isAmharic ? "ወይም የምስል ሊንክ..." : "Or paste image URL..."}
                              value={newAddImageUrl} 
                              onChange={(e) => setNewAddImageUrl(e.target.value)}
                              className="p-1 px-2 border border-stone-300 rounded-lg text-xs font-mono bg-white text-stone-900 w-36 sm:w-48"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (newAddImageUrl.trim()) {
                                  setAdditionalImages([...additionalImages, newAddImageUrl.trim()]);
                                  setNewAddImageUrl('');
                                }
                              }}
                              className="bg-[#8B4513] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-opacity-90 transition-all cursor-pointer shrink-0"
                            >
                              {isAmharic ? 'አክል' : 'Add'}
                            </button>
                          </div>
                        </div>

                        {additionalImages.length > 0 && (
                          <div className="flex flex-wrap gap-2.5 pt-2">
                            {additionalImages.map((img, idx) => (
                              <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-stone-300 group shadow-xs">
                                <img src={img} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                                <button
                                  type="button"
                                  onClick={() => setAdditionalImages(additionalImages.filter((_, i) => i !== idx))}
                                  className="absolute top-1 right-1 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-full shadow-md hover:scale-105 transition-all text-[8px] leading-[8px]"
                                  title={isAmharic ? 'አስወግድ' : 'Remove'}
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-3">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold cursor-pointer"
                      >
                        {isAmharic ? 'ማስተካከያውን አስቀምጥ' : 'Save Form Edits'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPost(null);
                          setImageFileUrl('');
                          setImageFile(null);
                        }}
                        className="px-4 py-2 bg-stone-300 hover:bg-stone-400 text-stone-800 rounded-lg cursor-pointer"
                      >
                        {isAmharic ? 'ይቅር' : 'Cancel'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Admin Tabs navigation with 3px text-to-tab spacing */}
              <div className="flex flex-wrap gap-1.5 border-b border-stone-100 pb-3 mb-6" id="admin-tabs">
                <button
                  id="tab-admin-pending"
                  onClick={() => setAdminTab('pending')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    adminTab === 'pending'
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-600'
                  }`}
                >
                  {isAmharic ? 'የሚጠባበቁ ፖስቶች / Approved' : 'Pending Approvals'} ({listings.filter(l => (l as any).status === 'pending').length})
                </button>
                <button
                  id="tab-admin-all"
                  onClick={() => setAdminTab('all-posts')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    adminTab === 'all-posts'
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-600'
                  }`}
                >
                  {isAmharic ? 'ሁሉንም ሰርዝ/አስተካክል CRUD' : 'Manage Listings (CRUD)'}
                </button>
                <button
                  id="tab-admin-create"
                  onClick={() => setAdminTab('create-post')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    adminTab === 'create-post'
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-600'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5 inline mr-1" />
                  {isAmharic ? 'አዲስ ፖስት ጨምር' : 'Add New Listing'}
                </button>
                <button
                  id="tab-admin-chats"
                  onClick={() => setAdminTab('chats')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    adminTab === 'chats'
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-600'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{isAmharic ? 'የደንበኞች ቻት' : 'Customer Chat'}</span>
                  {chatMessages.filter(m => m.receiverId === 'admin' && !m.read).length > 0 && (
                    <span className="bg-rose-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-sans font-black animate-pulse">
                      {chatMessages.filter(m => m.receiverId === 'admin' && !m.read).length}
                    </span>
                  )}
                </button>
                <button
                  id="tab-admin-history"
                  onClick={() => setAdminTab('history')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    adminTab === 'history'
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-600'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{isAmharic ? 'የግብይት ታሪክ' : 'History'}</span>
                </button>
                <button
                  id="tab-admin-requests"
                  onClick={() => setAdminTab('requests')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    adminTab === 'requests'
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-600'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{isAmharic ? 'የደንበኞች ትዕዛዝ' : 'User Requests'}</span>
                  {userRequests.filter(r => r.status === 'pending').length > 0 && (
                    <span className="bg-rose-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-sans font-black animate-pulse">
                      {userRequests.filter(r => r.status === 'pending').length}
                    </span>
                  )}
                </button>
              </div>

              {/* VIEW: Pending approvals */}
              {adminTab === 'pending' && (
                <div className="space-y-4 animate-fade-in" id="admin-tab-pending">
                  <h3 className="text-sm font-bold text-[#8B4513] border-b border-stone-100 pb-2 mb-4">
                    {isAmharic ? 'የአባላት ማረጋገጫ የሚጠብቁ ማስታወቂያዎች' : 'User Uploads Waiting for Security Vetting'}
                  </h3>

                  {listings.filter(l => (l as any).status === 'pending').length === 0 ? (
                    <div className="text-center py-10 bg-stone-50 rounded-2xl border border-stone-150">
                      <Clock className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                      <p className="text-xs text-stone-550 font-sans">
                        {isAmharic ? 'ምንም የሚጠብቅ ማስታወቂያ የለም።' : 'All user uploaded listings are vetted & verified.'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {listings.filter(l => (l as any).status === 'pending').map((item: any) => (
                        <div key={item.id} className="bg-[#FCFAF2] border border-[#C19A6B]/25 p-4 rounded-2xl relative overflow-hidden flex flex-col justify-between">
                          <div>
                            {/* Visual alert */}
                            <div className="flex items-center justify-between mb-2 pb-2 border-b border-stone-150/60">
                              <span className="text-[9px] bg-amber-50 text-amber-800 border border-amber-200 font-bold px-2 py-0.5 rounded-full uppercase flex items-center space-x-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                <span>PENDING AD APPROVAL</span>
                              </span>
                              <span className="text-[10px] text-stone-400 font-mono font-bold">
                                {item.category.toUpperCase()}
                              </span>
                            </div>

                            <p className="text-xs font-black text-stone-900 leading-snug">
                              {isAmharic ? item.titleAm : item.titleEn}
                            </p>

                            <div className="my-2 p-2.5 bg-stone-100 rounded-xl border border-stone-200">
                              <p className="text-[11px] text-stone-700 leading-normal line-clamp-3 mb-1">
                                <span className="font-bold block text-[#8B4513]">
                                  {isAmharic ? 'መግለጫ፡' : 'Desc:'}
                                </span>
                                {isAmharic ? item.descriptionAm : item.descriptionEn}
                              </p>
                              
                              {/* Attached video indicator */}
                              {item.video && (
                                <div className="mt-2 text-[10px] bg-indigo-50 text-indigo-700 font-semibold px-2 py-1 rounded border border-indigo-150 flex items-center space-x-1 w-fit">
                                  <Film className="w-3.5 h-3.5" />
                                  <span>{isAmharic ? 'ቪዲዮ ተያይዟል (ከ30MB በታች)' : 'Video Attached (< 30MB)'}</span>
                                </div>
                              )}
                            </div>

                            {/* PRIVATE SENSITIVE OWNER DETALS (ADMIN ONLY) */}
                            <div className="bg-[#135D66]/5 border border-[#135D66]/20 p-2.5 rounded-xl text-xs mb-3 space-y-1">
                              <p className="text-[10px] font-bold text-[#135D66] uppercase tracking-wide">
                                🔐 Creator Contacts (Hidden from Public)
                              </p>
                              <p className="font-bold text-stone-800">
                                {isAmharic ? 'የባለቤት ስም፡' : 'Owner/Submitter Name:'} <span className="text-stone-900 font-black font-sans">{item.realOwnerName || 'Unknown User'}</span>
                              </p>
                              <p className="font-sans font-bold text-stone-700">
                                {isAmharic ? 'ትክክለኛ ስልክ ቁጥር፡' : 'Private Phone Number:'} <span className="text-stone-950 font-black font-mono select-all bg-white px-1 ml-1 rounded">{item.realOwnerPhone || '0900000000'}</span>
                              </p>
                              <p className="text-[9px] text-[#135D66] font-medium leading-normal italic">
                                * Warning: Once approved, this owner phone is masked out and substituted with the official admin broker line: 0914842611.
                              </p>
                            </div>
                          </div>

                          {/* Approval actions */}
                          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-150">
                            <button
                              id={`edit-btn-${item.id}`}
                              onClick={() => {
                                handleStartEdit(item);
                                document.getElementById('listings-inline-editor')?.scrollIntoView({ behavior: 'smooth' });
                              }}
                              className="py-2 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer"
                              title={isAmharic ? 'ከማጽደቅዎ በፊት ያርሙ' : 'Edit details before approving'}
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>{isAmharic ? 'አስተካክል' : 'Edit'}</span>
                            </button>
                            
                            <button
                              id={`approve-btn-${item.id}`}
                              onClick={() => handleApprovePost(item.id)}
                              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold font-sans flex items-center justify-center space-x-1.5 transition-all active:scale-97 cursor-pointer min-w-[150px]"
                            >
                              <Check className="w-4 h-4" />
                              <span>{isAmharic ? 'ፍቀድ / አውጣ (Mask with 0914842611)' : 'Approve & Mask'}</span>
                            </button>
                            <button
                              id={`reject-btn-${item.id}`}
                              onClick={() => handleRejectPost(item.id)}
                              className="py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                            >
                              {isAmharic ? 'ውድቅ አድርግ' : 'Reject'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* VIEW: CRUD LISTINGS (All Posts) */}
              {adminTab === 'all-posts' && (
                <div className="space-y-4 animate-fade-in" id="admin-tab-crud">
                  <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2 mb-3 flex items-center justify-between">
                    <span>{isAmharic ? 'ሁሉንም ዝርዝሮች ማስተዳደር (CRUD Operations)' : 'Listings Database (CRUD Panel)'}</span>
                    <span className="text-[11px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded font-mono font-bold">
                      {listings.length} TOTAL
                    </span>
                  </h3>

                  <div className="space-y-2.5 max-h-[450px] overflow-y-auto pr-1">
                    {listings.map((item) => (
                      <div key={item.id} className="bg-white border border-stone-150 p-3.5 rounded-xl flex items-center justify-between gap-3 shadow-3xs">
                        <div className="flex items-center space-x-3 min-w-0">
                          <img
                            src={item.image}
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover border shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-black text-stone-900 truncate">
                              {isAmharic ? item.titleAm : item.titleEn}
                            </p>
                            <div className="flex items-center space-x-2 mt-1 text-[10px] text-stone-400">
                              <span className="font-bold px-1.5 py-0.5 rounded border uppercase">
                                {item.category}
                              </span>
                              <span>• {item.subCategory}</span>
                              <span className="font-mono text-stone-500">
                                {item.price ? `${new Intl.NumberFormat('en-US').format(item.price)} ETB` : 'Negotiable'}
                              </span>
                            </div>
                            {/* Contact mask indicator */}
                            <p className="text-[9px] text-[#8B4513] font-bold mt-0.5">
                              📞 Public Hotline: <span className="bg-stone-50 px-1 font-mono">{item.phone}</span> 
                              {((item as any).realOwnerPhone) && (
                                <span className="text-stone-400 font-medium ml-1">
                                  (Owner: {(item as any).realOwnerPhone})
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1.5 shrink-0">
                          <button
                            id={`crud-stamp-${item.id}`}
                            onClick={() => handleMarkRentedSold(item)}
                            title={isAmharic ? 'ተከራይቷል/ተሽጧል ብለህ መዝግብ (አውቶማቲክ ማስታወቂያ)' : 'Mark as Rented/Sold (Auto-Announcement)'}
                            className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-all pointer-events-auto cursor-pointer"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            id={`crud-edit-${item.id}`}
                            onClick={() => handleStartEdit(item)}
                            title={isAmharic ? 'አስተካክል' : 'Edit Listing'}
                            className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-all pointer-events-auto cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            id={`crud-delete-${item.id}`}
                            onClick={() => handleDeletePost(item.id)}
                            title={isAmharic ? 'ሰርዝ' : 'Delete Listing'}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* VIEW: Admin Create Post */}
              {(adminTab === 'create-post' || adminTab === 'pending' && listings.filter(l => (l as any).status === 'pending').length === 0 && listings.length === 0) && (
                <div className="animate-fade-in" id="admin-tab-create">
                  <h3 className="text-sm font-bold text-[#8B4513] border-b border-stone-100 pb-2 mb-4">
                    📢 {isAmharic ? 'አስተዳዳሪው በቀጥታ የሚለጥፍበት ቅጽ' : 'Post Direct Approved Listing'}
                  </h3>
                  {/* Reuse user post form directly for simple flow */}
                  <div className="p-1">
                    <form onSubmit={handleCreatePost} className="space-y-[3px]">
                      {/* Form Details inside AuthPanel */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-[3px]">
                            {isAmharic ? 'መደብ (Category)' : 'Category'}
                          </label>
                          <select 
                            value={postCategory} 
                            onChange={(e) => {
                              const cat = e.target.value as CategoryType;
                              setPostCategory(cat);
                              setPostSubCategory(cat === 'servant' ? 'የቤት' : 'የሚከራይ');
                            }}
                            className="w-full p-2.5 border border-stone-300 rounded-lg text-xs"
                          >
                            <option value="house">House (ቤት)</option>
                            <option value="car">Car (መኪና)</option>
                            <option value="servant">Servant/Hiring (ሰራተኛ)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-[3px]">
                            {isAmharic ? 'ንዑስ ምድብ (Subclass)' : 'Subcategory'}
                          </label>
                          <select 
                            value={postSubCategory} 
                            onChange={(e) => setPostSubCategory(e.target.value)}
                            className="w-full p-2.5 border border-stone-300 rounded-lg text-xs bg-white text-stone-900 cursor-pointer"
                          >
                            {getSubCategoryOptions(postCategory).map((opt) => (
                              <option key={opt.val} value={opt.val}>
                                {isAmharic ? opt.nameAm : opt.nameEn}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Title inputs */}
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-[3px]">Amharic Title</label>
                          <input 
                            type="text" 
                            required 
                            placeholder="ቤት ቦሌ የሚከራይ..."
                            value={postTitleAm} 
                            onChange={(e) => setPostTitleAm(e.target.value)}
                            className="w-full p-2.5 border border-stone-300 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-[3px]">English Title</label>
                          <input 
                            type="text" 
                            required 
                            placeholder="Luxury Villa in Bole for rent..."
                            value={postTitleEn} 
                            onChange={(e) => setPostTitleEn(e.target.value)}
                            className="w-full p-2.5 border border-stone-300 rounded-lg text-xs"
                          />
                        </div>
                      </div>

                      {/* Price & Location */}
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-[3px]">Price (Birr)</label>
                          <input 
                            type="number" 
                            placeholder="120000"
                            value={postPrice} 
                            onChange={(e) => setPostPrice(e.target.value)}
                            className="w-full p-2.5 border border-stone-300 rounded-lg text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-[3px]">
                            {isAmharic ? 'ምስል / ፎቶ ይምረጡ' : 'Select Photo / Image'}
                          </label>
                          <div className="space-y-1">
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={handleImageFileChange}
                              className="w-full text-xs font-sans text-stone-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border file:border-[#C19A6B]/30 file:text-[10px] file:font-semibold file:bg-white file:text-[#8B4513] hover:file:bg-natural-light/50 cursor-pointer"
                            />
                            <input 
                              type="text" 
                              placeholder={isAmharic ? "ወይም የምስል ሊንክ ሊንክ እዚህ ያስገቡ..." : "Or paste image URL..."}
                              value={imageUrl} 
                              onChange={(e) => setImageUrl(e.target.value)}
                              className="w-full p-2.5 border border-stone-300 rounded-lg text-xs font-mono bg-white text-stone-900"
                            />
                          </div>
                          {imageFileUrl && (
                            <div className="mt-1 flex items-center space-x-1.5">
                              <span className="text-[9px] text-emerald-700 font-bold">✓ {isAmharic ? 'ተመርጧል' : 'Selected'}</span>
                              <img src={imageFileUrl} className="w-6 h-6 rounded object-cover border" alt="Preview" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Additional Multiple Images */}
                      <div className="mt-4 p-4 bg-stone-100 rounded-2xl border border-stone-200">
                        <label className="block text-stone-700 text-xs font-bold mb-2">
                          ✨ {isAmharic ? 'የቀሩት ተጨማሪ ምስሎች (ጋለሪ)' : 'Additional Gallery Photos (Multiple)'}
                        </label>
                        <div className="space-y-3">
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input 
                              type="file" 
                              multiple
                              accept="image/*"
                              onChange={handleMultipleImagesFileChange}
                              className="flex-1 text-xs font-sans text-stone-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-[#C19A6B]/30 file:text-[10px] file:font-semibold file:bg-white file:text-[#8B4513] hover:file:bg-natural-light/50 cursor-pointer"
                            />
                            <div className="flex gap-1.5">
                              <input 
                                type="text" 
                                placeholder={isAmharic ? "ወይም የምስል ሊንክ..." : "Or paste image URL..."}
                                value={newAddImageUrl} 
                                onChange={(e) => setNewAddImageUrl(e.target.value)}
                                className="p-1 px-2 border border-stone-300 rounded-lg text-xs font-mono bg-white text-stone-900 w-36 sm:w-48"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (newAddImageUrl.trim()) {
                                    setAdditionalImages([...additionalImages, newAddImageUrl.trim()]);
                                    setNewAddImageUrl('');
                                  }
                                }}
                                className="bg-[#8B4513] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-opacity-90 transition-all cursor-pointer shrink-0"
                              >
                                {isAmharic ? 'አክል' : 'Add'}
                              </button>
                            </div>
                          </div>

                          {additionalImages.length > 0 && (
                            <div className="flex flex-wrap gap-2.5 pt-2">
                              {additionalImages.map((img, idx) => (
                                <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-stone-300 group shadow-xs">
                                  <img src={img} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                                  <button
                                    type="button"
                                    onClick={() => setAdditionalImages(additionalImages.filter((_, i) => i !== idx))}
                                    className="absolute top-1 right-1 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-full shadow-md hover:scale-105 transition-all text-[8px] leading-[8px]"
                                    title={isAmharic ? 'አስወግድ' : 'Remove'}
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Image/video Upload File Simulator */}
                      <div className="bg-stone-50 border border-dashed border-stone-300 p-4 rounded-xl mt-3">
                        <label className="block text-[11px] font-bold text-stone-600 mb-1">
                          🎬 {isAmharic ? 'የቪዲዮ ማስታወቂያ ይጫኑ (ከ 30MB በታች)' : 'Attach Video Showcase (Max 30MB Limit)'}
                        </label>
                        <input 
                          type="file" 
                          accept="video/*"
                          onChange={handleVideoFileChange}
                          className="w-full text-xs font-sans text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border file:border-[#C19A6B]/30 file:text-xs file:font-semibold file:bg-white file:text-[#8B4513] hover:file:bg-natural-light/50"
                        />
                        {videoError && <p className="text-[10px] text-rose-600 font-bold mt-1">{videoError}</p>}
                        {videoFile && (
                          <p className="text-[10px] text-emerald-700 font-bold mt-1">
                            ✓ {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(1)}MB) - Size Checked OK!
                          </p>
                        )}
                      </div>

                      {/* Submit */}
                      <div className="pt-4">
                        <button
                          type="submit"
                          className="px-6 py-3 bg-natural-accent hover:bg-natural-accent/90 text-white font-bold rounded-xl text-xs transition-transform transform active:scale-97 cursor-pointer block w-full text-center"
                        >
                          {isAmharic ? 'አሁን ፖስቱን በቀጥታ ፍቀድና ልቀቅ' : 'Publish Approved Listing'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* VIEW: Admin Chats view */}
              {adminTab === 'chats' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in" id="admin-tab-chats">
                  {/* Left user room selector */}
                  <div className="md:col-span-4 bg-stone-50 rounded-2xl border p-4">
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">
                      Active Customer Rooms
                    </p>
                    <div className="space-y-1.5">
                      {getMessagingUsers().length === 0 ? (
                        <p className="text-[11px] text-stone-500 italic">No customers have messy messages.</p>
                      ) : (
                        getMessagingUsers().map(userEmail => (
                          <button
                            key={userEmail}
                            id={`chat-user-row-${userEmail}`}
                            onClick={() => setSelectedChatUser(userEmail)}
                            className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                              selectedChatUser === userEmail
                                ? 'bg-[#C19A6B]/15 text-[#8B4513] font-bold border border-[#C19A6B]/20'
                                : 'bg-white hover:bg-stone-100 text-stone-700 border'
                            }`}
                          >
                            <span className="truncate pr-2">{userEmail}</span>
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Right Chat panel */}
                  <div className="md:col-span-8 flex flex-col h-[380px] bg-white rounded-2xl border p-4 justify-between">
                    <div className="text-xs bg-stone-50 p-2.5 rounded-lg mb-2 flex items-center justify-between border">
                      <span className="font-extrabold text-stone-700">Conversing with: {selectedChatUser || 'Nobody Selected'}</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-black">ONLINE</span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 py-2 max-h-[220px]">
                      {getThreadMessages().length === 0 ? (
                        <div className="text-center py-8 text-stone-400 text-xs">
                          Choose a client or send an introductory welcoming text to start exchanging.
                        </div>
                      ) : (
                        getThreadMessages().map((msg) => {
                          const isMe = msg.senderId === 'admin';
                          return (
                            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                              <span className="text-[9px] text-stone-400 mb-0.5 font-bold">
                                {msg.senderName} ({new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})
                              </span>
                              <p className={`p-2.5 rounded-2xl text-xs max-w-[80%] leading-relaxed ${
                                isMe 
                                  ? 'bg-stone-900 text-white rounded-tr-none' 
                                  : 'bg-stone-100 text-stone-850 rounded-tl-none'
                              }`}>
                                <WordByWordMessage text={msg.text} />
                                {(() => {
                                  const tagged = detectTaggedListing(msg.text, listings);
                                  if (!tagged) return null;
                                  return (
                                    <div className="mt-2 flex items-center space-x-2 bg-amber-500/10 border border-amber-500/25 p-1.5 rounded-xl text-[10px] text-amber-900 pointer-events-auto max-w-xs text-left">
                                      <img src={tagged.image} className="w-6 h-6 rounded object-cover border border-amber-500/20 shrink-0" alt="" />
                                      <div className="min-w-0 flex-1">
                                        <p className="font-extrabold truncate text-stone-900">{isAmharic ? tagged.titleAm : tagged.titleEn}</p>
                                        <p className="text-[9px] text-[#8B4513] font-bold font-mono">Code: #{tagged.id} • {tagged.price ? `${new Intl.NumberFormat().format(tagged.price)} ETB` : 'Negotiable'}</p>
                                      </div>
                                    </div>
                                  );
                                })()}
                              </p>
                            </div>
                          );
                        })
                      )}
                      <div ref={chatBottomRef} />
                    </div>

                    <form onSubmit={handleSendMessage} className="space-y-[3px] mt-2 flex items-center gap-2">
                      <input
                        id="admin-chat-input"
                        type="text"
                        disabled={!selectedChatUser}
                        placeholder={selectedChatUser ? (isAmharic ? 'መልስዎን እዚህ ይጻፉ...' : 'Type direct response here...') : 'Select a user workspace chat'}
                        value={typedMessage}
                        onChange={(e) => setTypedMessage(e.target.value)}
                        className="flex-1 p-2.5 text-xs border border-stone-300 rounded-xl outline-hidden focus:border-natural-accent bg-white text-stone-900"
                      />
                      <button
                        id="admin-chat-send-btn"
                        type="submit"
                        disabled={!selectedChatUser || !typedMessage.trim()}
                        className="p-2.5 bg-stone-900 hover:bg-stone-950 text-white rounded-xl active:scale-95 disabled:opacity-40 pointer-events-auto"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* VIEW: Transaction History */}
              {adminTab === 'history' && (
                <div className="space-y-4 animate-fade-in" id="admin-tab-history">
                  <div className="flex justify-between items-center border-b border-stone-100 pb-2 mb-4">
                    <h3 className="text-sm font-bold text-[#8B4513]">
                      {isAmharic ? 'የደላላው የክንውኖች እና ግብይቶች ታሪክ' : 'Transaction & Verification History Logs'}
                    </h3>
                    <button
                      onClick={() => {
                        fetch('/api/announcements')
                          .then(res => res.json())
                          .then(data => {
                            if (Array.isArray(data)) {
                              setHistoryItems(data);
                            }
                          })
                          .catch(err => console.error('Error reloading history:', err));
                      }}
                      className="text-[10px] font-bold text-natural-accent hover:text-natural-accent/90 flex items-center space-x-1"
                    >
                      <span>🔄 {isAmharic ? 'አድስ' : 'Refresh'}</span>
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                    {historyItems.length === 0 ? (
                      <p className="text-xs text-stone-500 italic py-6 text-center">
                        {isAmharic ? 'ምንም የግብይት ታሪክ አልተመዘገበም።' : 'No transactional history logs found yet.'}
                      </p>
                    ) : (
                      historyItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-xs bg-stone-50 p-3 rounded-xl border border-stone-200/50 hover:bg-stone-100/30 transition-all shadow-3xs gap-3">
                          <div className="flex items-start space-x-2">
                            <span className="text-emerald-600 font-bold shrink-0 mt-0.5">✓</span>
                            <p className="font-semibold text-stone-800 leading-relaxed">
                              {isAmharic ? item.textAm : item.textEn}
                            </p>
                          </div>
                          <span className="text-[10px] text-stone-500 font-mono shrink-0 whitespace-nowrap bg-stone-200/50 px-2 py-0.5 rounded-md">
                            {new Date(item.timestamp).toLocaleString(isAmharic ? 'am-ET' : 'en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* VIEW: Customer requests */}
              {adminTab === 'requests' && (
                <div className="space-y-4 animate-fade-in" id="admin-tab-requests">
                  <div className="flex justify-between items-center border-b border-stone-100 pb-2 mb-4">
                    <h3 className="text-sm font-bold text-[#8B4513]">
                      {isAmharic ? 'የደንበኞች ትዕዛዝና ፍላጎቶች' : 'Customer Custom Broker Orders Database'}
                    </h3>
                    <button
                      onClick={() => {
                        fetch('/api/requests')
                          .then(res => res.json())
                          .then(data => {
                            if (Array.isArray(data)) {
                              setUserRequests(data);
                            }
                          })
                          .catch(err => console.error('Error reloading requests:', err));
                      }}
                      className="text-[10px] font-bold text-natural-accent hover:text-natural-accent/90 flex items-center space-x-1"
                    >
                      <span>🔄 {isAmharic ? 'አድስ' : 'Refresh'}</span>
                    </button>
                  </div>

                  {userRequests.length === 0 ? (
                    <div className="text-center py-10 bg-stone-50 rounded-2xl border border-stone-150">
                      <Clock className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                      <p className="text-xs text-stone-550 font-sans">
                        {isAmharic ? 'ምንም የደንበኛ ትዕዛዝ አልተመዘገበም።' : 'No custom customer orders in database.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                      {userRequests.map((req) => (
                        <div key={req.id} className="bg-white border border-stone-150 p-4 rounded-xl shadow-3xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-sans text-xs">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2 flex-wrap gap-1">
                              <span className="font-extrabold text-[#876545]">{req.name}</span>
                              <span className="text-[10px] text-stone-500 font-mono">({req.phone})</span>
                              <span className="text-[9px] text-[#8B4513] bg-[#8B4513]/5 border border-[#8B4513]/10 px-1.5 py-0.5 rounded uppercase font-bold">
                                {isAmharic ? (req.requestType === 'house' ? 'ቤት' : req.requestType === 'car' ? 'መኪና' : 'ሰራተኛ') : req.requestType} • {req.subCategory}
                              </span>
                            </div>
                            <p className="text-stone-600 font-medium leading-relaxed max-w-xl text-left">{req.details}</p>
                            <p className="text-[9.5px] text-stone-400 text-left">{isAmharic ? 'የተመዘገበበት ቀን' : 'Registered at'}: {new Date(req.createdAt).toLocaleString()}</p>
                          </div>
                          
                          <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                            {/* Status label dropdown */}
                            <select
                              value={req.status}
                              onChange={(e) => {
                                const newStatus = e.target.value as any;
                                fetch(`/api/requests/${req.id}`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ status: newStatus })
                                })
                                  .then(() => fetch('/api/requests'))
                                  .then(res => res.json())
                                  .then(data => {
                                    if (Array.isArray(data)) setUserRequests(data);
                                  });
                              }}
                              className="p-1 px-2 border rounded-lg bg-stone-50 font-sans font-bold cursor-pointer text-[11px]"
                            >
                              <option value="pending">{isAmharic ? 'እየተጠበቀ' : 'Pending'}</option>
                              <option value="reviewed">{isAmharic ? 'በግምገማ ላይ' : 'Reviewed'}</option>
                              <option value="resolved">{isAmharic ? 'ተፈቷል' : 'Resolved'}</option>
                            </select>

                            {/* Delete button */}
                            <button
                              onClick={() => {
                                if (window.confirm(isAmharic ? 'ይህን ትዕዛዝ በቋሚነት መሰረዝ ይፈልጋሉ?' : 'Are you sure to delete this custom requirement?')) {
                                  fetch(`/api/requests/${req.id}`, { method: 'DELETE' })
                                    .then(() => fetch('/api/requests'))
                                    .then(res => res.json())
                                    .then(data => {
                                      if (Array.isArray(data)) setUserRequests(data);
                                    });
                                }
                              }}
                              className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg pointer-events-auto cursor-pointer flex items-center justify-center transition-colors"
                              title={isAmharic ? 'አጥፋ' : 'Delete'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (

            // 3B. REGISTERED USER PANEL
            <div id="user-panel-view">
              {/* User Navigation Tabs */}
              <div className="flex items-center space-x-2 border-b border-stone-100 pb-3 mb-6" id="user-tabs">
                <button
                  id="tab-user-upload"
                  onClick={() => setUserTab('upload')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    userTab === 'upload'
                      ? 'bg-natural-accent text-white shadow-xs'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-600'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5 inline mr-1" />
                  {isAmharic ? 'ቤት/መኪና/ሰራተኛ መለጠፊያ ቅጽ' : 'Upload Listing Ad'}
                </button>
                <button
                  id="tab-user-posts"
                  onClick={() => setUserTab('my-posts')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    userTab === 'my-posts'
                      ? 'bg-natural-accent text-white shadow-xs'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-600'
                  }`}
                >
                  {isAmharic ? 'የእኔ ማስታወቂያዎች' : 'My Listings Status'}
                </button>
                <button
                  id="tab-user-chat"
                  onClick={() => setUserTab('chat')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    userTab === 'chat'
                      ? 'bg-natural-accent text-white shadow-xs'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-600'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 inline mr-1 animate-bounce" />
                  {isAmharic ? 'ከደላላው ጋር ቻት' : 'Live Chat with Admin'}
                </button>
              </div>

              {/* USER VIEW: Upload listing */}
              {userTab === 'upload' && (
                <div className="bg-stone-50/50 p-5 rounded-2xl border border-stone-200 animate-fade-in" id="user-upload-view">
                  <div className="mb-4 bg-amber-50 border border-amber-100 p-3.5 rounded-xl text-amber-800 text-[10.5px] leading-relaxed">
                    <p className="font-extrabold flex items-center space-x-1.5 uppercase mb-1">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span> {isAmharic ? 'የደላላው የደህንነት ማስታወቂያ' : 'Direct Intermediary Masking Standard'}</span>
                    </p>
                    <p>
                      {isAmharic 
                        ? 'በመመሪያችን መሰረት፤ እርስዎ የእርስዎን ስልክ እና ዝርዝር መግለጫ ለጥፈው ሲልኩ፤ መረጃዎን በመጀመሪያ የአስተዳዳሪው አስተዳደር (Vetting Desk) ይመረምራል። ፖስቱ በተጠቃሚዎች ሲታይ የደዋዮች የግል መረጃ እንዳይባክን የደላላው ዋና ስልክ 0914842611 ሆኖ ይታያል። የእርስዎ ስልክ መለያ ደግሞ በአስተዳዳሪው በኩል ብቻ በጥንቃቄ ተመዝግቦ ይቀመጣል።'
                        : 'To protect seller-buyer privacy in Ethiopia, once your item is approved, the public catalog masks your private phone and displays only official administrative hotline: 0914842611. Your real owner contact is secured privately in the admin panel.'}
                    </p>
                  </div>

                  <form onSubmit={handleCreatePost} className="space-y-[3px] font-sans">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Class */}
                      <div>
                        <label className="block text-stone-600 text-xs font-medium pl-1 mb-[3px]">
                          {isAmharic ? 'ለመለጠፍ የፈለጉት ነገር' : 'Portal'}
                        </label>
                        <select 
                          value={postCategory} 
                          onChange={(e) => {
                            const cat = e.target.value as CategoryType;
                            setPostCategory(cat);
                            setPostSubCategory(cat === 'servant' ? 'የቤት' : 'የሚከራይ');
                          }}
                          className="w-full px-4 py-2.5 rounded-xl border border-stone-250 outline-hidden bg-white text-xs text-stone-900 cursor-pointer"
                        >
                          <option value="house">{isAmharic ? 'ቤት / Property (ቤት)' : 'Property (ቤት)'}</option>
                          <option value="car">{isAmharic ? 'መኪና / Automobile (መኪና)' : 'Automobile (መኪና)'}</option>
                          <option value="servant">{isAmharic ? 'ቅጥር ሰራተኛ / Staffing (ሰራተኛ)' : 'Domestic Staffing (ሰራተኛ)'}</option>
                        </select>
                      </div>

                      {/* Subclass */}
                      <div>
                        <label className="block text-stone-600 text-xs font-medium pl-1 mb-[3px]">
                          {isAmharic ? 'ንዑስ ምድብ (Subclass)' : 'Subcategory Type'}
                        </label>
                        <select 
                          value={postSubCategory} 
                          onChange={(e) => setPostSubCategory(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-stone-250 outline-hidden bg-white text-xs text-stone-900 cursor-pointer"
                        >
                          {getSubCategoryOptions(postCategory).map((opt) => (
                            <option key={opt.val} value={opt.val}>
                              {isAmharic ? opt.nameAm : opt.nameEn}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Titles */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                      <div>
                        <label className="block text-stone-600 text-xs font-medium pl-1 mb-[3px]">
                          {isAmharic ? 'የፖስቱ ርዕስ (በአማርኛ)' : 'Amharic Title'}
                        </label>
                        <input 
                          type="text" 
                          required
                          placeholder={isAmharic ? "ለምሳሌ፡ ባለ 3 መኝታ ቤት የሚከራይ ቪላ" : "e.g. Modern Villa for rent"}
                          value={postTitleAm}
                          onChange={(e) => {
                            setPostTitleAm(e.target.value);
                            setPostTitleEn(e.target.value); // Fallback sync
                          }}
                          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 outline-hidden text-xs bg-white text-stone-900"
                        />
                      </div>
                      <div>
                        <label className="block text-stone-600 text-xs font-medium pl-1 mb-[3px]">
                          {isAmharic ? 'የፖስቱ ርዕስ (በእንግሊዝኛ)' : 'English Title'}
                        </label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. 3-bedroom villa for Rent around Bole"
                          value={postTitleEn}
                          onChange={(e) => setPostTitleEn(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 outline-hidden text-xs bg-white text-stone-900"
                        />
                      </div>
                    </div>

                    {/* Price with monthly or negotiable rates */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                       <div>
                        <label className="block text-stone-600 text-xs font-medium pl-1 mb-[3px]">
                          {isAmharic ? 'ተፈላጊ ዋጋ / ደመወዝ (በብር)' : 'Target Price / Salary (ETB)'}
                        </label>
                        <input 
                          type="number" 
                          placeholder="e.g. 15000"
                          value={postPrice}
                          onChange={(e) => setPostPrice(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 outline-hidden text-xs bg-white text-stone-900 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-stone-600 text-xs font-medium pl-1 mb-[3px]">
                          {isAmharic ? 'የዋጋ ሁኔታ' : 'Payment Model'}
                        </label>
                        <select 
                          value={postPriceType} 
                          onChange={(e: any) => setPostPriceType(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-stone-250 outline-hidden bg-white text-xs text-stone-900 cursor-pointer"
                        >
                          <option value="rent">{isAmharic ? 'በወር ኪራይ / monthly' : 'Monthly Rent'}</option>
                          <option value="sale">{isAmharic ? 'ለሽያጭ ሙሉ ክፍያ' : 'For Sale Full Deal'}</option>
                          <option value="salary_monthly">{isAmharic ? 'የስራ ደመወዝ በወር' : 'Monthly Job Salary'}</option>
                          <option value="salary_negotiable">{isAmharic ? 'ድርድር / negotiable' : 'Negotiable Rates'}</option>
                        </select>
                      </div>
                    </div>

                    {/* Description Amharic */}
                    <div className="mt-2">
                      <label className="block text-stone-600 text-xs font-medium pl-1 mb-[3px]">
                        {isAmharic ? 'ስለ ዕቃው/ስራው ዝርዝር መግለጫ (በአማርኛ)' : 'Detailed Description (Amharic)'}
                      </label>
                      <textarea 
                        rows={2}
                        placeholder={getDescriptionPlaceholder(postCategory, isAmharic)}
                        value={postDescAm}
                        onChange={(e) => {
                          setPostDescAm(e.target.value);
                          setPostDescEn(e.target.value); // Fallback sync
                        }}
                        className="w-full px-4 py-2 rounded-xl border border-stone-200 outline-hidden text-xs bg-white text-stone-900"
                      />
                    </div>

                    {/* Location & Image files option */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                      <div>
                        <label className="block text-stone-600 text-xs font-medium pl-1 mb-[3px]">
                          {isAmharic ? 'አድራሻ (ቦታ)' : 'Location'}
                        </label>
                        <input 
                          type="text" 
                          placeholder={isAmharic ? "ቦሌ፣ አዲስ አበባ" : "Bole, Addis Ababa"}
                          value={postLocAm}
                          onChange={(e) => {
                            setPostLocAm(e.target.value);
                            setPostLocEn(e.target.value); // Sync English is fine!
                          }}
                          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 outline-hidden text-xs bg-white text-stone-900"
                        />
                      </div>
                      <div>
                        <label className="block text-stone-600 text-xs font-medium pl-1 mb-[3px]">
                          {isAmharic ? 'ምስል / ፎቶ ይምረጡ' : 'Select Photo / Image'}
                        </label>
                        <div className="space-y-1.5">
                          {/* File input */}
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleImageFileChange}
                            className="w-full text-xs font-sans text-stone-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-[#C19A6B]/30 file:text-[11px] file:font-semibold file:bg-white file:text-[#8B4513] hover:file:bg-natural-light/50 cursor-pointer"
                          />
                          {/* Alternative url text field */}
                          <input 
                            type="text" 
                            placeholder={isAmharic ? "ወይም የምስል ሊንክ ሊንክ እዚህ ያስገቡ..." : "Or paste image URL here..."}
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            className="w-full p-2 border border-stone-200 rounded-lg text-xs font-mono bg-white text-stone-900"
                          />
                        </div>
                        {imageFileUrl && (
                          <div className="mt-1 flex items-center space-x-2">
                            <span className="text-[10px] text-emerald-700 font-bold">✓ {isAmharic ? 'ምስል ተመርጧል' : 'Image selected!'}</span>
                            <img src={imageFileUrl} className="w-8 h-8 rounded object-cover border" alt="Preview" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Additional Multiple Images */}
                    <div className="mt-4 p-4 bg-stone-100 rounded-2xl border border-stone-200">
                      <label className="block text-stone-700 text-xs font-bold mb-2">
                        ✨ {isAmharic ? 'የቀሩት ተጨማሪ ምስሎች (ጋለሪ)' : 'Additional Gallery Photos (Multiple)'}
                      </label>
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input 
                            type="file" 
                            multiple
                            accept="image/*"
                            onChange={handleMultipleImagesFileChange}
                            className="flex-1 text-xs font-sans text-stone-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-[#C19A6B]/30 file:text-[10px] file:font-semibold file:bg-white file:text-[#8B4513] hover:file:bg-natural-light/50 cursor-pointer"
                          />
                          <div className="flex gap-1.5">
                            <input 
                              type="text" 
                              placeholder={isAmharic ? "ወይም የምስል ሊንክ..." : "Or paste image URL..."}
                              value={newAddImageUrl} 
                              onChange={(e) => setNewAddImageUrl(e.target.value)}
                              className="p-1 px-2 border border-stone-300 rounded-lg text-xs font-mono bg-white text-stone-900 w-36 sm:w-48"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (newAddImageUrl.trim()) {
                                  setAdditionalImages([...additionalImages, newAddImageUrl.trim()]);
                                  setNewAddImageUrl('');
                                }
                              }}
                              className="bg-[#8B4513] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-opacity-90 transition-all cursor-pointer shrink-0"
                            >
                              {isAmharic ? 'አክል' : 'Add'}
                            </button>
                          </div>
                        </div>

                        {additionalImages.length > 0 && (
                          <div className="flex flex-wrap gap-2.5 pt-2">
                            {additionalImages.map((img, idx) => (
                              <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-stone-300 group shadow-xs">
                                <img src={img} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                                <button
                                  type="button"
                                  onClick={() => setAdditionalImages(additionalImages.filter((_, i) => i !== idx))}
                                  className="absolute top-1 right-1 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-full shadow-md hover:scale-105 transition-all text-[8px] leading-[8px]"
                                  title={isAmharic ? 'አስወግድ' : 'Remove'}
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* VIDEO UPLOADER COMPONENT (UP TO 30MB SIZE VERIFIED) */}
                    <div className="mt-3 bg-stone-100 p-4 rounded-xl border border-dashed border-stone-300">
                      <div className="mb-2 bg-[#C19A6B]/10 border border-[#C19A6B]/15 text-[#8B4513] text-[10.5px] font-bold px-2.5 py-1.5 rounded-lg flex items-center space-x-1.5 font-sans">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0"></span>
                        <span>
                          {isAmharic 
                            ? 'አስደሳች ዜና፡ አዲስ ተመዝጋቢዎች እስከ 30MB ቪዲዮ መጫን ይችላሉ!' 
                            : 'Good News: Newly registered users can upload videos up to 30MB!'}
                        </span>
                      </div>
                      <p className="text-[11px] font-bold text-stone-700 uppercase flex items-center space-x-1 mb-[3px]">
                        <Film className="w-4 h-4 text-natural-accent" />
                        <span> {isAmharic ? 'የቪዲዮ አጭር ማሳያ ይጫኑ (ማክስ 30MB)' : 'Attach Video Preview Clip (Max 30MB)'}</span>
                      </p>
                      
                      <input 
                        type="file" 
                        accept="video/*"
                        onChange={handleVideoFileChange}
                        className="w-full text-xs font-sans text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border file:border-[#C19A6B]/30 file:text-xs file:font-semibold file:bg-white file:text-[#8B4513] hover:file:bg-natural-light/50"
                      />
                      
                      {videoError && (
                        <p className="text-[10px] text-rose-600 font-bold mt-1.5 flex items-center space-x-1 font-sans">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{videoError}</span>
                        </p>
                      )}

                      {videoFile && (
                        <p className="text-[10px] text-emerald-700 font-bold mt-1.5 font-sans">
                          ✓ {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(1)}MB) - Size Checked OK!
                        </p>
                      )}
                      
                      <p className="text-[9px] text-stone-400 font-medium leading-normal mt-1 leading-normal">
                        {isAmharic 
                          ? '* ቪዲዮዎችን መስቀል ተጨማሪ ደንበኞችን በአስቸኳይ ለመሳብ ይረዳዎታል።' 
                          : '* Showcase clips strongly attract regional brokers.'}
                      </p>
                    </div>

                    <button
                      id="user-post-submit-btn"
                      type="submit"
                      className="w-full mt-4 py-3 bg-natural-accent hover:bg-natural-accent/90 text-white font-bold rounded-xl text-xs transition-transform transform active:scale-97 cursor-pointer text-center flex items-center justify-center space-x-2 shadow-sm pointer-events-auto"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>{isAmharic ? 'ፖስቱን አውጣ (Submit for Vetting)' : 'Upload Listing Ad'}</span>
                    </button>
                  </form>
                </div>
              )}

              {/* USER VIEW: My posts list */}
              {userTab === 'my-posts' && (
                <div className="space-y-4 animate-fade-in" id="user-myposts-view">
                  <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2 mb-3">
                    {isAmharic ? 'የእርስዎ ማስታወቂያዎች ሁኔታ' : 'Your uploaded listings status'}
                  </h3>

                  {listings.filter(l => (l as any).realOwnerPhone === currentUser.phone || (l as any).realOwnerName === currentUser.name).length === 0 ? (
                    <div className="text-center py-10 bg-stone-50 rounded-2xl border">
                      <Clock className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                      <p className="text-xs text-stone-500 font-sans">
                        {isAmharic ? 'እስካሁን ምንም ማስታወቂያ አልለጠፉም።' : 'No posts uploaded yet. Click "Upload Listing Ad" to draft one.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {listings.filter(l => (l as any).realOwnerPhone === currentUser.phone || (l as any).realOwnerName === currentUser.name).map((item: any) => (
                        <div key={item.id} className="bg-white border rounded-xl p-4 flex items-center justify-between gap-4 shadow-3xs">
                          <div className="flex items-center space-x-3.5 min-w-0">
                            <img
                              src={item.image}
                              alt=""
                              className="w-12 h-12 rounded-lg object-cover border"
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0 font-sans">
                              <p className="text-xs font-black text-stone-900 truncate">
                                {isAmharic ? item.titleAm : item.titleEn}
                              </p>
                              <div className="flex items-center space-x-2 mt-1 text-[10px] text-stone-400">
                                <span className="font-bold border px-1.5 py-0.5 rounded uppercase">
                                  {item.category}
                                </span>
                                <span>• {item.subCategory}</span>
                              </div>
                              <p className="text-[9.5px] text-stone-500 font-medium mt-0.5 leading-snug">
                                {isAmharic 
                                  ? `ህዝባዊ የስልክ ቁጥር ወደ 0914842611 ተቀይሯል። ትክክለኛ ስልክዎ፡ ${item.realOwnerPhone}`
                                  : `Intermediary Line: 0914842611. Your Private phone: ${item.realOwnerPhone}`}
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0 flex flex-col items-end">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              item.status === 'approved' 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                : item.status === 'rejected'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-100'
                                  : 'bg-amber-50 text-amber-700 border border-amber-150'
                            }`}>
                              {item.status === 'approved' 
                                ? (isAmharic ? 'የጸደቀ' : 'approved') 
                                : item.status === 'rejected'
                                  ? (isAmharic ? 'ውድቅ የተደረገ' : 'rejected')
                                  : (isAmharic ? 'ማረጋገጫ የሚጠብቅ' : 'pending approval')
                              }
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* USER VIEW: Chat thread */}
              {userTab === 'chat' && (
                <div className="bg-stone-50 rounded-2xl border p-4 animate-fade-in flex flex-col h-[340px] justify-between" id="user-chat-view">
                  <div className="flex items-center justify-between bg-stone-900 text-white p-2.5 rounded-xl text-xs mb-3">
                    <span className="font-bold">{isAmharic ? 'ቀጥታ መስመር ከደላላው አስተዳዳሪ ጋር' : 'Chat with Support Representative'}</span>
                    <span className="text-[9px] bg-emerald-500 text-white font-bold px-2 py-0.5 rounded animate-pulse">LIVE</span>
                  </div>

                  {/* Messages list */}
                  <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 max-h-[190px] py-1">
                    {getThreadMessages().length === 0 ? (
                      <p className="text-center py-6 text-xs text-stone-400">
                        Hello! Introduce your item requirements, ask a commission inquiry, or enquire about post statuses. Type below.
                      </p>
                    ) : (
                      getThreadMessages().map((msg) => {
                        const isMe = msg.senderId === currentUser.email;
                        return (
                          <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            <span className="text-[9px] text-stone-400 mb-0.5 font-bold">
                              {msg.senderName} ({new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})
                            </span>
                            <p className={`p-2.5 rounded-2xl text-xs max-w-[80%] leading-relaxed ${
                              isMe 
                                ? 'bg-natural-accent text-white rounded-tr-none' 
                                : 'bg-white text-stone-900 border border-stone-200 rounded-tl-none'
                            }`}>
                              <WordByWordMessage text={msg.text} />
                              {(() => {
                                const tagged = detectTaggedListing(msg.text, listings);
                                if (!tagged) return null;
                                return (
                                  <div className={`mt-2 flex items-center space-x-2 border p-1.5 rounded-xl text-[10px] pointer-events-auto max-w-xs text-left ${
                                    isMe 
                                      ? 'bg-amber-100/95 border-amber-200 text-amber-950 font-sans'
                                      : 'bg-stone-50 border-stone-200 text-stone-800'
                                  }`}>
                                    <img src={tagged.image} className="w-6 h-6 rounded object-cover border shrink-0" alt="" />
                                    <div className="min-w-0 flex-1">
                                      <p className="font-extrabold truncate text-stone-900">{isAmharic ? tagged.titleAm : tagged.titleEn}</p>
                                      <p className="text-[9px] text-[#8B4513] font-bold font-mono">Code: #{tagged.id} • {tagged.price ? `${new Intl.NumberFormat().format(tagged.price)} ETB` : 'Negotiable'}</p>
                                    </div>
                                  </div>
                                );
                              })()}
                            </p>
                          </div>
                        );
                      })
                    )}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Type form with 3px top margin */}
                  <form onSubmit={handleSendMessage} className="space-y-[3px] mt-3 flex items-center gap-1.5">
                    <input
                      id="user-chat-input"
                      type="text"
                      placeholder={isAmharic ? 'መልዕክትዎን እዚህ ይጻፉ...' : 'Ask catalog help, commission negotiation...'}
                      value={typedMessage}
                      onChange={(e) => setTypedMessage(e.target.value)}
                      className="flex-1 px-4 py-2 text-xs border border-stone-200 rounded-xl outline-hidden focus:border-natural-accent bg-white text-stone-950 font-sans"
                    />
                    <button
                      id="user-chat-send-btn"
                      type="submit"
                      disabled={!typedMessage.trim()}
                      className="p-2.5 bg-stone-900 hover:bg-stone-950 text-white rounded-xl active:scale-95 disabled:opacity-50 pointer-events-auto shrink-0 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
