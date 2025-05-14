const { MENU, USER_LEVEL_AKSES } = require("../models");

exports.getMenusByLevel = async (req, res) => {
  if (!req.user || !req.user.level) {
    return res
      .status(401)
      .json({ message: "Unauthorized: User level not found." });
  }

  const userLevelCode = req.user.level;

  try {
    const allowedAccess = await USER_LEVEL_AKSES.findAll({
      where: { LEVAC_MASTER: userLevelCode },
      attributes: ["LEVAC_MENU"], 
    });

    if (!allowedAccess || allowedAccess.length === 0) {
      return res.json({}); 
    }

    const allowedMenuIds = allowedAccess.map((access) => access.LEVAC_MENU);

    const allAllowedMenus = await MENU.findAll({
      where: {
        id: allowedMenuIds, 
      },
      raw: true,
    });

    const menuMap = {};
    const rootMenus = [];

    allAllowedMenus.forEach((menu) => {
      menu.subItems = [];
      menuMap[menu.id] = menu;
    });

    allAllowedMenus.forEach((menu) => {
      if (menu.MENU_PARENT_ID && menuMap[menu.MENU_PARENT_ID]) {
        menuMap[menu.MENU_PARENT_ID].subItems.push({
          name: menu.MENU_NAMA,
          path: menu.MENU_PATH,
        });
      } else {
        rootMenus.push(menu);
      }
    });

    const groupedMenus = rootMenus.reduce((acc, menu) => {
      const group = menu.MENU_GROUP || "Lainnya";
      if (!acc[group]) {
        acc[group] = [];
      }

      acc[group].push({
        name: menu.MENU_NAMA,
        path: menu.MENU_PATH,
        subItems: menu.subItems.map((sub) => ({
          name: sub.name,
          path: sub.path,
        })),
      });

      acc[group].sort((a, b) => a.name.localeCompare(b.name));
      return acc;
    }, {});

    res.status(200).json(groupedMenus);
  } catch (error) {
    console.error("Error fetching menus by level:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
