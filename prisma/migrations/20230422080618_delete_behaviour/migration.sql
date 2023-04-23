-- DropForeignKey
ALTER TABLE "bookmark" DROP CONSTRAINT "bookmark_offer_id_fkey";

-- DropForeignKey
ALTER TABLE "bookmark" DROP CONSTRAINT "bookmark_user_id_fkey";

-- DropForeignKey
ALTER TABLE "offer" DROP CONSTRAINT "offer_creator_id_fkey";

-- AddForeignKey
ALTER TABLE "offer" ADD CONSTRAINT "offer_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "auth_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmark" ADD CONSTRAINT "bookmark_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmark" ADD CONSTRAINT "bookmark_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
