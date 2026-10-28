export const fullAdmin=user=>user?.role==='admin'&&!Array.isArray(user.adminAccess);
export const canAdmin=(user,scope)=>fullAdmin(user)||(user?.role==='admin'&&user.adminAccess?.includes(scope));
