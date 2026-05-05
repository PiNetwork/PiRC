export interface ConfigGenerateOptions {
    contractName: string;
}
export interface Configs {
    packageJson: string;
    tsConfig: string;
    gitignore: string;
    readme: string;
}
/**
 * Generates a complete TypeScript project structure with contract bindings
 */
export declare class ConfigGenerator {
    /**
     * Generate the complete TypeScript project
     */
    generate(options: ConfigGenerateOptions): Configs;
    /**
     * Generate package.json
     */
    private generatePackageJson;
    /**
     * Generate tsconfig.json
     */
    private generateTsConfig;
    /**
     * Generate .gitignore
     */
    private generateGitignore;
    /**
     * Generate README.md
     */
    private generateReadme;
}
