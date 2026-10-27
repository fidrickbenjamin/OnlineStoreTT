HEADER DEPENDENCY FIX FOR THE HUB UPGRADE

The earlier hub ZIP depended on shared files from the top-header update. This patch includes the complete latest header files, including Food Hub, Ride Hub and Delivery Hub links.

1. Extract this ZIP into your project ROOT: E:\Web Projects\OnlineStore
2. Merge its frontend folder with your existing frontend folder and replace the matching files. Do not extract it inside frontend, which would create frontend/frontend.
3. Confirm this file exists:
   E:\Web Projects\OnlineStore\frontend\src\components\seasonal\SeasonalContext.jsx
4. Rebuild from your current frontend prompt:
   npm run build
5. Include these files in your next commit/deployment.

All six source files must be copied together. The provider in SeasonalStorefront shares the existing season with the header; creating only an empty missing file would not supply seasonal data.

No backend/app.js, PaymentMethod.jsx, environment/config files, build folders, payment integration or hub booking/earnings code is included or changed. These are the same source versions used in the successfully built and browser-checked hub release.
