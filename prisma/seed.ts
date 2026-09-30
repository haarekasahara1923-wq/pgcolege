import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Seed Admin
  const adminEmail = process.env.ADMIN_EMAIL || "admin@prathvigroup.edu.in";
  let passwordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!passwordHash) {
    // Default fallback hash for "Admin@12345" if ADMIN_PASSWORD_HASH is not set
    passwordHash = await bcrypt.hash("Admin@12345", 10);
    console.log("⚠️ ADMIN_PASSWORD_HASH not found in env, using default password: Admin@12345");
  }

  const existingAdmin = await prisma.admin.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    await prisma.admin.create({
      data: {
        email: adminEmail,
        passwordHash,
      },
    });
    console.log(`✅ Admin account created: ${adminEmail}`);
  } else {
    console.log(`ℹ️ Admin account already exists: ${adminEmail}`);
  }

  // 2. Seed Default AboutContent
  const existingAbout = await prisma.aboutContent.findFirst();
  if (!existingAbout) {
    await prisma.aboutContent.create({
      data: {
        title: "Welcome to Prathvi Group of College",
        description:
          "Prathvi Group of College is a premier educational institution committed to imparting excellence in higher education, professional training, and technical learning. Located in Morar, Gwalior, our campus provides an inspiring atmosphere for students across multiple disciplines.",
        vision:
          "To be a distinguished center of educational brilliance, nurturing ethical, technically competent, and visionary leaders who contribute to societal growth.",
        mission:
          "To provide student-centric quality education through modern infrastructure, dedicated pedagogy, practical industry exposure, and holistic character building.",
      },
    });
    console.log("✅ Default AboutContent created");
  } else {
    console.log("ℹ️ AboutContent already exists");
  }

  // 3. Seed Default ContactDetails
  const existingContact = await prisma.contactDetails.findFirst();
  if (!existingContact) {
    await prisma.contactDetails.create({
      data: {
        address: "Vill. Khureri, Behind Devraj Hospital, Morar, Gwalior (Madhya Pradesh)",
        phones: ["+91 94251 12345", "+91 751 2456789"],
        emails: ["info@prathvigroup.edu.in", "admissions@prathvigroup.edu.in"],
        whatsappNumber: "919425112345",
        whatsappGreeting: "Hello Prathvi Group of College, I would like to know more about admission and courses.",
        workingHours: "Monday - Saturday: 9:00 AM - 5:00 PM",
        mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d114543.83441584319!2d78.11894441464843!3d26.216666662483877!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3976c68c22222222%3A0x1111111111111111!2sMorar%2C%20Gwalior%2C%20Madhya%20Pradesh!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
        facebook: "https://facebook.com",
        instagram: "https://instagram.com",
        youtube: "https://youtube.com",
        twitter: "https://twitter.com",
        linkedin: "https://linkedin.com",
      },
    });
    console.log("✅ Default ContactDetails created");
  } else {
    console.log("ℹ️ ContactDetails already exists");
  }

  console.log("🌱 Database seeding completed successfully! (No mock colleges or courses added, as required)");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
