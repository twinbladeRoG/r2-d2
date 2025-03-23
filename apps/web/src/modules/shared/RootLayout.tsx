import {
  AppShell,
  Avatar,
  Burger,
  Card,
  Group,
  ScrollArea,
  Skeleton,
  Text,
  Title
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Navigate, Outlet } from "react-router-dom";
import { useActiveUser } from "../../apis/queries/auth.queries";

const RootLayout = () => {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  const user = useActiveUser();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened }
      }}
      padding={"md"}>
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger
            opened={mobileOpened}
            onClick={toggleMobile}
            hiddenFrom="sm"
            size="sm"
          />
          <Burger
            opened={desktopOpened}
            onClick={toggleDesktop}
            visibleFrom="sm"
            size="sm"
          />
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <AppShell.Section>
          <Title>R2 D2</Title>
        </AppShell.Section>

        <AppShell.Section grow component={ScrollArea}>
          Navbar
        </AppShell.Section>

        <AppShell.Section>
          {user.isLoading ? (
            <Skeleton h={100} mt="sm" animate={false} />
          ) : (
            <Card>
              <div className="flex items-center gap-7">
                <Avatar size={"lg"}>
                  {user.data?.first_name?.charAt(0)}
                  {user.data?.last_name?.charAt(0)}
                </Avatar>
                <div className="">
                  <Text>
                    {user.data?.first_name} {user.data?.last_name}
                  </Text>
                  <Text>@{user.data?.username}</Text>
                  <Text size="xs">{user.data?.email}</Text>
                </div>
              </div>
            </Card>
          )}
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        {user.isError ? <Navigate to="/login" /> : <Outlet />}
      </AppShell.Main>
    </AppShell>
  );
};

export default RootLayout;
